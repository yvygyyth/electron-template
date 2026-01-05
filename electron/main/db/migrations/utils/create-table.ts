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
 * 根据表名和列定义创建表
 *
 * @param db 数据库实例
 * @param tableName 表名
 * @param columns 列定义数组
 */
export async function createTablesFromColumns(
    db: Kysely<any>,
    tableName: string,
    columns: ColumnDefinition[]
): Promise<void> {
    // 检查表是否已存在
    const exists = await tableExists(db, tableName)

    if (exists) {
        return
    }

    // 创建表构建器
    let builder = db.schema.createTable(tableName)

    // 添加所有列
    for (const column of columns) {
        builder = builder.addColumn(column.name, column.type, (col) => {
            if (column.primaryKey) {
                col = col.primaryKey()
            }
            if (column.autoIncrement && column.type === 'integer') {
                col = col.autoIncrement()
            }
            if (column.notNull) {
                col = col.notNull()
            }
            if (column.unique) {
                col = col.unique()
            }
            if (column.defaultValue !== undefined) {
                // 如果 defaultValue 是被括号包裹的字符串，当作 SQL 语句执行
                // 否则使用字面值
                if (isSqlExpression(column.defaultValue)) {
                    col = col.defaultTo(sql.raw(column.defaultValue as string))
                } else {
                    col = col.defaultTo(column.defaultValue)
                }
            }
            // 添加外键约束
            // SQLite 允许外键引用"尚未存在的表"，只要插入数据时表都存在即可
            // 因此可以直接在创建表时添加外键，无需考虑表的创建顺序
            if (column.foreignKey) {
                const fk = column.foreignKey
                const referencedTable = fk.table
                const referencedColumn = fk.column || 'id'
                const onDelete = fk.onDelete || 'restrict'
                const onUpdate = fk.onUpdate || 'restrict'

                // 使用 references 方法添加外键约束，格式：'table.column'
                col = col.references(`${referencedTable}.${referencedColumn}`)

                // 设置删除和更新行为
                if (onDelete === 'cascade') {
                    col = col.onDelete('cascade')
                } else if (onDelete === 'set null') {
                    col = col.onDelete('set null')
                } else if (onDelete === 'restrict' || onDelete === 'no action') {
                    col = col.onDelete('restrict')
                }

                if (onUpdate === 'cascade') {
                    col = col.onUpdate('cascade')
                } else if (onUpdate === 'set null') {
                    col = col.onUpdate('set null')
                } else if (onUpdate === 'restrict' || onUpdate === 'no action') {
                    col = col.onUpdate('restrict')
                }
            }
            return col
        })
    }

    // 执行创建表
    await builder.execute()
}
