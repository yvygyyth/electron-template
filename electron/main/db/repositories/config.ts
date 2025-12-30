import { getDatabase } from '../index'
import type { ConfigKey, ConfigCreateInput } from '@share/index'
/**
 * Config Repository
 * 提供配置数据的 CRUD 操作
 */
export class ConfigRepository {
    /**
     * 批量创建配置
     * @param items 配置项数组
     */
    async batchCreate(items: ConfigCreateInput[]): Promise<void> {
        const db = getDatabase()

        await db
            .insertInto('config')
            .values(
                items.map((item) => ({
                    key: item.key,
                    value: item.value,
                    description: item.description ?? null
                }))
            )
            .execute()
    }

    /**
     * 全部读取配置
     * @returns 所有配置项
     */
    async getAll() {
        const db = getDatabase()
        return await db.selectFrom('config').selectAll().execute()
    }

    /**
     * 根据 key 单个读取整列
     * @param key 配置 key
     * @returns 配置项，如果不存在则返回 undefined
     */
    async getByKey(key: ConfigKey) {
        const db = getDatabase()
        const result = await db.selectFrom('config').selectAll().where('key', '=', key).executeTakeFirst()
        return result
    }

    /**
     * 单个删除配置
     * @param key 配置 key
     */
    async deleteByKey(key: ConfigKey): Promise<void> {
        const db = getDatabase()
        await db.deleteFrom('config').where('key', '=', key).execute()
    }

    /**
     * 根据 key 只更新 value 本身
     * @param key 配置 key
     * @param value 新的 value 值（字符串）
     */
    async updateValueByKey(key: ConfigKey, value: string): Promise<void> {
        const db = getDatabase()
        await db.updateTable('config').set({ value }).where('key', '=', key).execute()
    }

    /**
     * 根据 key 更新整列
     * @param key 配置 key
     * @param data 要更新的数据（不包含 id 和 key）
     */
    async updateByKey(
        key: ConfigKey,
        data: {
            value?: string
            description?: string | null
            created_at?: number
            updated_at?: number
        }
    ): Promise<void> {
        const db = getDatabase()
        await db.updateTable('config').set(data).where('key', '=', key).execute()
    }
}

// 导出单例实例
export const configRepository = new ConfigRepository()
