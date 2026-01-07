import { z } from 'zod'
import { ConfigKeyArray, type ConfigKey } from './enum'
import type { ConfigValueType } from './common'

// ==================== IPC 请求验证模型定义 ====================

/**
 * 获取单个配置的请求模型
 */
export const GetConfigRequestSchema = z.enum(ConfigKeyArray)

/**
 * 更新配置的请求模型（用于运行时验证）
 * 注意：此 schema 无法表达 key 和 value 之间的类型关联，仅用于运行时验证
 */
export const UpdateConfigRequestSchema = z.object({
    /** 配置 key */
    key: z.enum(ConfigKeyArray),
    /** 配置值 */
    value: z.unknown()
})

// ==================== 导出类型 ====================

/**
 * 获取单个配置的请求类型
 */
export type GetConfigRequest = z.infer<typeof GetConfigRequestSchema>

/**
 * 更新配置的请求类型（泛型版本，支持类型推导）
 * @template K 配置 key 类型
 */
export type UpdateConfigRequest<K extends ConfigKey = ConfigKey> = {
    /** 配置 key */
    key: K
    /** 配置值（根据 key 自动推导类型） */
    value: ConfigValueType<K>
}
