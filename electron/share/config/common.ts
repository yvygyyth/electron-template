import { z } from 'zod'
import { ConfigKeys, type ConfigKey } from './enum'

// ==================== 配置验证模型定义 ====================

/**
 * 应用设置配置验证模型
 */
export const AppSettingsConfigSchema = z.object({
    /** 应用语言 */
    language: z.enum(['zh-CN', 'en-US', 'ja-JP']).default('zh-CN'),
    /** 是否自动检查更新 */
    autoCheckUpdate: z.boolean().default(true),
    /** 是否开机自启 */
    autoStart: z.boolean().default(false),
    /** 是否显示系统托盘 */
    showTray: z.boolean().default(true)
})

/**
 * 主题配置验证模型
 */
export const ThemeConfigSchema = z.object({
    /** 主题模式 */
    mode: z.enum(['light', 'dark', 'auto']).default('auto'),
    /** 主色调 */
    primaryColor: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/)
        .default('#007bff'),
    /** 字体大小 */
    fontSize: z.number().int().min(10).max(24).default(14),
    /** 是否启用动画 */
    enableAnimation: z.boolean().default(true)
})

// ==================== 导出类型 ====================

/**
 * 应用设置配置类型
 */
export type AppSettingsConfig = z.infer<typeof AppSettingsConfigSchema>

/**
 * 主题配置类型
 */
export type ThemeConfig = z.infer<typeof ThemeConfigSchema>

// ==================== 配置类型映射 ====================

/**
 * 配置类型映射，用于类型推断
 */
export interface ConfigTypeMap {
    [ConfigKeys.APP_SETTINGS]: AppSettingsConfig
    [ConfigKeys.THEME]: ThemeConfig
}

/**
 * 配置 Schema 映射，用于验证
 */
export const ConfigSchemaMap: Record<ConfigKey, z.ZodSchema> = {
    [ConfigKeys.APP_SETTINGS]: AppSettingsConfigSchema,
    [ConfigKeys.THEME]: ThemeConfigSchema
}

/**
 * 根据配置 key 获取对应的配置类型
 */
export type ConfigValueType<K extends ConfigKey> = ConfigTypeMap[K]

/**
 * 创建配置项的输入类型（用于种子数据和批量创建）
 * value 字段存储为 JSON 字符串
 */
export interface ConfigCreateInput {
    /** 配置 key */
    key: ConfigKey
    /** 配置值（JSON 字符串） */
    value: string
    /** 配置说明 */
    description?: string | null
}
