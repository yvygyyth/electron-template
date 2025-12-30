/**
 * 配置 Key 常量定义
 */
export const ConfigKeys = {
    /** 应用设置 */
    APP_SETTINGS: 'app.settings',
    /** 主题配置 */
    THEME: 'app.theme'
} as const

/**
 * 配置 Key 类型
 */
export type ConfigKey = (typeof ConfigKeys)[keyof typeof ConfigKeys]

/**
 * 配置 Key 值数组
 */
export const ConfigKeyArray = Object.values(ConfigKeys) as ConfigKey[]
