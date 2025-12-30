import type { Kysely } from 'kysely'
import { sql } from 'kysely'
import type { TriggerDefinition } from '../../type'

/**
 * 检查触发器是否存在
 */
async function triggerExists(db: Kysely<any>, triggerName: string): Promise<boolean> {
    const result = await db
        .selectFrom('sqlite_master')
        .select('name')
        .where('type', '=', 'trigger')
        .where('name', '=', triggerName)
        .executeTakeFirst()
    return !!result
}

/**
 * 根据表名和单个触发器定义创建触发器
 *
 * @param db 数据库实例
 * @param tableName 表名
 * @param trigger 触发器定义
 */
export async function createTriggerFromDefinition(
    db: Kysely<any>,
    tableName: string,
    trigger: TriggerDefinition
): Promise<void> {
    // 验证触发器定义中的表名是否匹配
    if (trigger.table !== tableName) {
        console.warn(
            `⚠️  触发器 ${trigger.name} 定义中的表名 ${trigger.table} 与传入的表名 ${tableName} 不匹配，跳过创建`
        )
        return
    }

    // 检查触发器是否已存在
    const exists = await triggerExists(db, trigger.name)

    if (exists) {
        console.log(`⏭️  触发器 ${trigger.name} 已存在，跳过创建`)
        return
    }

    console.log(`⚡ 创建触发器: ${trigger.name}`)

    // 构建触发器创建语句
    // SQLite 触发器语法: CREATE TRIGGER name [BEFORE|AFTER] [INSERT|UPDATE|DELETE] ON table FOR EACH ROW BEGIN sql END
    const triggerSql = `CREATE TRIGGER ${trigger.name} ${trigger.timing} ${trigger.event} ON ${tableName} FOR EACH ROW BEGIN ${trigger.sql} END`

    // 执行创建触发器
    await sql.raw(triggerSql).execute(db)
    console.log(`✅ 触发器 ${trigger.name} 创建成功`)
}

/**
 * 根据表名和触发器定义创建触发器
 *
 * @param db 数据库实例
 * @param tableName 表名
 * @param triggers 触发器定义数组
 */
export async function createTriggersFromDefinitions(
    db: Kysely<any>,
    tableName: string,
    triggers: TriggerDefinition[]
): Promise<void> {
    for (const trigger of triggers) {
        await createTriggerFromDefinition(db, tableName, trigger)
    }
}
