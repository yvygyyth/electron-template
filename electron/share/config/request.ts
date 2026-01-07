import { z } from 'zod'
import { ConfigKeyArray } from './enum'

// ==================== IPC 请求验证模型定义 ====================

/**
 * 获取单个配置的请求模型
 */
export const GetConfigRequestSchema = z.enum(ConfigKeyArray)

/**
 * 更新配置的请求模型
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
 * 更新配置的请求类型
 */
export type UpdateConfigRequest = z.infer<typeof UpdateConfigRequestSchema>
