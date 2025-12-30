import type { ConfigKey } from './enum'
import type { ConfigValueType } from './common'

/**
 * 配置项数据结构
 */
export interface ConfigItem<K extends ConfigKey = ConfigKey> {
    /** 配置 ID */
    id: number
    /** 配置 key */
    key: K
    /** 配置值（已解析的 JSON） */
    value: ConfigValueType<K>
    /** 配置说明 */
    description: string | null
    /** 创建时间（时间戳） */
    created_at: number
    /** 更新时间（时间戳） */
    updated_at: number
}

/**
 * 获取单个配置的返回类型
 */
export type GetConfigResponse<K extends ConfigKey = ConfigKey> = ConfigItem<K>

/**
 * 获取所有配置的返回类型
 */
export type GetAllConfigResponse = ConfigItem[]
