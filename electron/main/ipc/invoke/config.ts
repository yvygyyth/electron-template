import { ipcMain } from 'electron'
import { configService } from '@main/service/config'
import { GetConfigRequestSchema, UpdateConfigRequestSchema, ConfigSchemaMap, ConfigIpcHandler } from '@share/index'
import type {
    ConfigKey,
    ConfigValueType,
    GetConfigRequest,
    UpdateConfigRequest,
    GetConfigResponse,
    GetAllConfigResponse
} from '@share/index'

// ==================== IPC 业务逻辑函数 ====================

/**
 * 获取配置的业务逻辑函数
 * @param key 配置 key
 * @returns 配置项
 */
async function getConfigHandler<K extends ConfigKey>(key: K): Promise<GetConfigResponse<K>> {
    // 校验请求参数
    const validatedKey = GetConfigRequestSchema.parse(key) as K
    return configService.getConfig(validatedKey)
}

/**
 * 更新配置的业务逻辑函数
 * @param data 更新配置的请求数据
 * @returns 更新后的配置项
 */
async function updateConfigHandler<K extends ConfigKey>(data: UpdateConfigRequest<K>): Promise<GetConfigResponse<K>> {
    // 校验请求参数
    const validatedData = UpdateConfigRequestSchema.parse(data)
    const { key, value } = validatedData

    // 校验配置值（根据 key 对应的 schema）
    const configKey = key as K
    const schema = ConfigSchemaMap[configKey]
    if (!schema) {
        throw new Error(`未找到配置 key "${key}" 对应的 schema`)
    }
    const validatedValue = schema.parse(value) as ConfigValueType<K>

    // 调用业务层（只允许更新，不允许创建）
    await configService.updateConfig(configKey, validatedValue)

    // 返回更新后的配置
    return configService.getConfig(configKey)
}

/**
 * 获取所有配置的业务逻辑函数
 * @returns 所有配置项数组
 */
async function getAllConfigsHandler(): Promise<GetAllConfigResponse> {
    return configService.getAllConfigs()
}

// ==================== IPC 业务逻辑函数类型 ====================

/**
 * 获取配置的业务逻辑函数类型
 */
export type GetConfigHandler = typeof getConfigHandler

/**
 * 更新配置的业务逻辑函数类型
 */
export type UpdateConfigHandler = typeof updateConfigHandler

/**
 * 获取所有配置的业务逻辑函数类型
 */
export type GetAllConfigsHandler = typeof getAllConfigsHandler

// ==================== IPC 处理器注册 ====================

/**
 * 配置相关的 IPC 处理器
 */
export function registerConfigHandlers() {
    // 获取配置
    ipcMain.handle(ConfigIpcHandler.get, async (_, key: GetConfigRequest) => {
        try {
            return getConfigHandler(key)
        } catch (error) {
            console.error('获取配置失败:', error)
            throw error
        }
    })

    // 更新配置（仅允许更新已存在的配置，不允许创建）
    ipcMain.handle(ConfigIpcHandler.update, async (_, data: UpdateConfigRequest) => {
        try {
            // 运行时已验证 data.key 是有效的 ConfigKey，使用类型断言
            return updateConfigHandler(data)
        } catch (error) {
            console.error('更新配置失败:', error)
            throw error
        }
    })

    // 获取所有配置
    ipcMain.handle(ConfigIpcHandler.getAll, async () => {
        try {
            return getAllConfigsHandler()
        } catch (error) {
            console.error('获取所有配置失败:', error)
            throw error
        }
    })
}

/**
 * 注销配置相关的 IPC 处理器
 */
export function unregisterConfigHandlers() {
    ipcMain.removeHandler(ConfigIpcHandler.get)
    ipcMain.removeHandler(ConfigIpcHandler.update)
    ipcMain.removeHandler(ConfigIpcHandler.getAll)
}

/**
 * 导出类型
 */
export type ConfigHandlers = {
    [ConfigIpcHandler.get]: GetConfigHandler
    [ConfigIpcHandler.update]: UpdateConfigHandler
    [ConfigIpcHandler.getAll]: GetAllConfigsHandler
}
