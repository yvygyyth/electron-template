import {
    ConfigKeys,
    type ConfigKey,
    type ConfigValueType,
    type ConfigTypeMap,
    type ConfigCreateInput
} from '@share/index'
import type { Kysely } from 'kysely'
import type { Database } from '../index'

/**
 * 类型安全的种子数据项定义
 * 确保 key 和 value 的类型对应关系正确
 */
type SeedDataItem<K extends ConfigKey> = {
    key: K
    value: ConfigValueType<K>
    description: string | null
}

/**
 * 将类型安全的种子数据转换为数据库输入格式
 */
function createSeedItem<K extends ConfigKey>(item: SeedDataItem<K>): ConfigCreateInput {
    return {
        key: item.key,
        value: JSON.stringify(item.value),
        description: item.description
    }
}

/**
 * Config 表的种子数据
 * 定义表创建后需要插入的默认数据
 * 使用类型安全的定义，确保 key 和 value 的对应关系正确
 */
const configSeedDataRaw: Array<SeedDataItem<ConfigKey>> = [
    {
        key: ConfigKeys.APP_SETTINGS,
        value: {
            language: 'zh-CN',
            autoCheckUpdate: true,
            autoStart: false,
            showTray: true
        } satisfies ConfigTypeMap[typeof ConfigKeys.APP_SETTINGS],
        description: '应用设置配置'
    },
    {
        key: ConfigKeys.THEME,
        value: {
            mode: 'auto',
            primaryColor: '#007bff',
            fontSize: 14,
            enableAnimation: true
        } satisfies ConfigTypeMap[typeof ConfigKeys.THEME],
        description: '主题配置'
    }
]

/**
 * 转换后的种子数据（用于数据库插入）
 */
export const configSeedData: ConfigCreateInput[] = configSeedDataRaw.map(createSeedItem)

/**
 * 插入 Config 表的种子数据
 * 如果数据已存在（通过 key 判断），则跳过插入
 *
 * @param db 数据库实例
 */
export async function seedConfigTable(db: Kysely<Database>): Promise<void> {
    for (const item of configSeedData) {
        // 检查是否已存在
        const existing = await db.selectFrom('config').select('key').where('key', '=', item.key).executeTakeFirst()

        // 如果不存在，则插入
        if (!existing) {
            await db
                .insertInto('config')
                .values({
                    key: item.key,
                    value: item.value,
                    description: item.description ?? null
                    // created_at 和 updated_at 由触发器自动设置
                })
                .execute()
        }
    }
}
