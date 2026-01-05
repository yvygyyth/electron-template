import type { Kysely } from 'kysely'
import { sql } from 'kysely'
import type { ColumnDefinition } from '../../type'
import { isSqlExpression } from './sqlTool'

/**
 * 检查表是否存在
 */
async function tableExists(db: Kysely<any>, tableName: string): Promise<boolean> {
    const result = await db
        .selectFrom('sqlite_master')
        .select('name')
        .where('type', '=', 'table')
        .where('name', '=', tableName)
        .executeTakeFirst()
    return !!result
}

/**
 * 获取表中现有的列名列表
 */
async function getExistingColumns(db: Kysely<any>, tableName: string): Promise<string[]> {
    const result = await sql<{ name: string }>`
        PRAGMA table_info(${sql.id(tableName)})
    `.execute(db)
    return result.rows.map((row) => row.name)
}

/**
 * 将列定义转换为 SQLite 类型字符串
 */
function columnTypeToString(column: ColumnDefinition): string {
    const typeMap: Record<ColumnDefinition['type'], string> = {
        integer: 'INTEGER',
        text: 'TEXT',
        real: 'REAL',
        blob: 'BLOB'
    }
    return typeMap[column.type]
}

/**
 * 转义 SQLite 标识符（表名、列名）
 */
function escapeIdentifier(identifier: string): string {
    // SQLite 使用方括号或反引号转义标识符
    // 为了安全，我们将标识符用方括号包裹
    return `[${identifier.replace(/\]/g, ']]')}]`
}

/**
 * 构建列的 SQL 定义字符串（用于 ALTER TABLE ADD COLUMN）
 * 注意：SQLite 的 ALTER TABLE ADD COLUMN 只支持：
 * - 列名和类型
 * - NOT NULL（必须有默认值）
 * - DEFAULT 值
 * 不支持：PRIMARY KEY、AUTOINCREMENT、UNIQUE、外键约束
 */
function buildColumnSql(column: ColumnDefinition): string {
    // 转义列名
    const columnName = escapeIdentifier(column.name)
    let sql = `${columnName} ${columnTypeToString(column)}`

    // ALTER TABLE ADD COLUMN 只支持 NOT NULL 和 DEFAULT
    if (column.notNull) {
        sql += ' NOT NULL'
    }
    if (column.defaultValue !== undefined) {
        // 如果 defaultValue 是被括号包裹的字符串，当作 SQL 语句执行
        // 否则作为字面值字符串处理
        let defaultValue: string | number | Buffer
        const value = column.defaultValue
        if (typeof value === 'string') {
            // 使用公共函数检查是否是 SQL 表达式
            if (isSqlExpression(value)) {
                // SQL 表达式已经包含括号，直接使用
                defaultValue = value
            } else {
                // 字面值字符串需要转义单引号并用引号包裹
                // 注意：此时 value 仍然是 string 类型，但 TypeScript 类型系统需要类型断言
                const stringValue: string = value
                defaultValue = `'${stringValue.replace(/'/g, "''")}'`
            }
        } else {
            // 数字或 Buffer 直接返回
            defaultValue = value
        }
        sql += ` DEFAULT ${defaultValue}`
    }

    return sql
}

/**
 * 检查并添加缺失的列到现有表中
 *
 * @param db 数据库实例
 * @param tableName 表名
 * @param columns 列定义数组
 */
export async function addMissingColumns(
    db: Kysely<any>,
    tableName: string,
    columns: ColumnDefinition[]
): Promise<void> {
    // 检查表是否存在
    const exists = await tableExists(db, tableName)
    if (!exists) {
        // 表不存在，不需要添加列
        return
    }

    // 获取现有列名
    const existingColumns = await getExistingColumns(db, tableName)
    const existingColumnSet = new Set(existingColumns)

    // 找出缺失的列
    const missingColumns = columns.filter((col) => !existingColumnSet.has(col.name))

    if (missingColumns.length === 0) {
        // 没有缺失的列
        return
    }

    // 添加缺失的列
    for (const column of missingColumns) {
        // SQLite ALTER TABLE ADD COLUMN 的限制：
        // 1. 不能添加 PRIMARY KEY
        // 2. 不能添加 AUTOINCREMENT
        // 3. 不能添加 UNIQUE 约束
        // 4. 不能添加外键约束
        // 5. 不能添加 NOT NULL 约束（除非有默认值）

        // 如果列有主键约束，跳过（SQLite 不支持在已有表中添加主键列）
        if (column.primaryKey) {
            console.warn(`警告: 无法向表 ${tableName} 添加主键列 ${column.name}，SQLite 不支持在已有表中添加主键列`)
            continue
        }

        // 如果列有 AUTOINCREMENT，跳过（SQLite 不支持在已有表中添加自增列）
        if (column.autoIncrement) {
            console.warn(`警告: 无法向表 ${tableName} 添加自增列 ${column.name}，SQLite 不支持在已有表中添加自增列`)
            continue
        }

        // 如果列有 UNIQUE 约束，警告但不跳过（添加列后再通过索引实现唯一性）
        if (column.unique) {
            console.warn(
                `警告: 列 ${column.name} 有 UNIQUE 约束，SQLite 不支持在 ALTER TABLE ADD COLUMN 中添加 UNIQUE，请手动创建唯一索引`
            )
        }

        // 如果列有外键约束，警告但不跳过（添加列但不包含外键约束）
        if (column.foreignKey) {
            console.warn(
                `警告: 列 ${column.name} 有外键约束，SQLite 不支持在已有表中添加外键约束，列将被添加但不包含外键约束`
            )
        }

        // 如果列有 NOT NULL 约束但没有默认值，需要添加默认值
        let columnToAdd = column
        if (column.notNull && column.defaultValue === undefined) {
            console.warn(
                `警告: 列 ${column.name} 有 NOT NULL 约束但没有默认值，SQLite 要求添加 NOT NULL 列时必须提供默认值，将使用类型默认值`
            )
            // 根据类型设置默认值（创建副本以避免修改原始对象）
            const defaultValues: Record<ColumnDefinition['type'], any> = {
                integer: 0,
                text: '',
                real: 0.0,
                blob: null
            }
            columnToAdd = { ...column, defaultValue: defaultValues[column.type] }
        }

        // 构建并执行 ALTER TABLE ADD COLUMN 语句
        const columnSql = buildColumnSql(columnToAdd)
        const tableNameEscaped = escapeIdentifier(tableName)
        await sql.raw(`ALTER TABLE ${tableNameEscaped} ADD COLUMN ${columnSql}`).execute(db)
    }
}
