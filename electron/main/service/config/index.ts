import { configRepository } from '@main/db/repositories/config'
import type { ConfigKey, ConfigValueType } from '@share/index'
import type { GetConfigResponse, GetAllConfigResponse } from '@share/index'

/**
 * 配置服务类
 * 作为 IPC 层和 Repository 层之间的桥梁
 * 负责 JSON 解析、数据转换等业务逻辑
 */
export class ConfigService {
    /**
     * 获取单个配置
     * @param key 配置 key
     * @returns 配置项，如果不存在则返回 null
     */
    async getConfig<K extends ConfigKey>(key: K): Promise<GetConfigResponse<K>> {
        const record = await configRepository.getByKey(key)
        return {
            ...record,
            key: record.key as K,
            value: JSON.parse(record.value) as ConfigValueType<K>
        }
    }

    /**
     * 更新配置（仅允许更新已存在的配置，不允许创建）
     * @param key 配置 key
     * @param value 配置值（对象，已在 IPC 层校验）
     * @throws 如果配置不存在则抛出错误
     */
    async updateConfig<K extends ConfigKey>(key: K, value: ConfigValueType<K>): Promise<void> {
        // 检查配置是否存在
        const existingRecord = await configRepository.getByKey(key)
        if (!existingRecord) {
            throw new Error(`配置不存在，无法更新 (key: ${key})`)
        }

        // 序列化为 JSON 字符串（value 已在 IPC 层校验）
        const valueString = JSON.stringify(value)

        await configRepository.updateValueByKey(key, valueString)
    }

    /**
     * 删除配置
     * @param key 配置 key
     */
    async deleteConfig(key: ConfigKey): Promise<void> {
        await configRepository.deleteByKey(key)
    }

    /**
     * 获取所有配置
     * @returns 所有配置项数组
     */
    async getAllConfigs(): Promise<GetAllConfigResponse> {
        const records = await configRepository.getAll()
        return records.map((record) => ({
            ...record,
            key: record.key as ConfigKey,
            value: JSON.parse(record.value) as ConfigValueType<ConfigKey>
        }))
    }
}

// 导出单例实例
export const configService = new ConfigService()
