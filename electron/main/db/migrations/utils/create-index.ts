import type { Kysely } from 'kysely'
import type { IndexDefinition } from '../../type'

/**
 * 检查索引是否存在
 */
async function indexExists(db: Kysely<any>, indexName: string): Promise<boolean> {
    const result = await db
        .selectFrom('sqlite_master')
        .select('name')
        .where('type', '=', 'index')
        .where('name', '=', indexName)
        .executeTakeFirst()
    return !!result
}

/**
 * 根据表名和单个索引定义创建索引
 *
 * @param db 数据库实例
 * @param tableName 表名
 * @param index 索引定义
 */
export async function createIndexFromDefinition(
    db: Kysely<any>,
    tableName: string,
    index: IndexDefinition
): Promise<void> {
    // 验证索引定义中的表名是否匹配
    if (index.table !== tableName) {
        console.warn(`⚠️  索引 ${index.name} 定义中的表名 ${index.table} 与传入的表名 ${tableName} 不匹配，跳过创建`)
        return
    }

    // 检查索引是否已存在
    const exists = await indexExists(db, index.name)

    if (exists) {
        console.log(`⏭️  索引 ${index.name} 已存在，跳过创建`)
        return
    }

    console.log(`📇 创建索引: ${index.name}`)

    // 构建索引创建语句
    const columns = Array.isArray(index.columns) ? index.columns : [index.columns]
    let builder = db.schema.createIndex(index.name).on(tableName)

    // 添加列
    for (const column of columns) {
        builder = builder.column(column)
    }

    // 如果是唯一索引
    if (index.unique) {
        builder = builder.unique()
    }

    // 执行创建索引
    await builder.execute()
    console.log(`✅ 索引 ${index.name} 创建成功`)
}

/**
 * 根据表名和索引定义创建索引
 *
 * @param db 数据库实例
 * @param tableName 表名
 * @param indexes 索引定义数组
 */
export async function createIndexesFromDefinitions(
    db: Kysely<any>,
    tableName: string,
    indexes: IndexDefinition[]
): Promise<void> {
    for (const index of indexes) {
        await createIndexFromDefinition(db, tableName, index)
    }
}
