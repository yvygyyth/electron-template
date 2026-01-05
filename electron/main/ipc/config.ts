import { ipcMain } from 'electron'
import { configService } from '@main/service/config'
import { GetConfigRequestSchema, UpdateConfigRequestSchema, ConfigSchemaMap, ConfigIpcHandler } from '@share/index'
import type { ConfigKey, ConfigValueType, GetConfigRequest, UpdateConfigRequest } from '@share/index'

/**
 * 配置相关的 IPC 处理器
 */
export function registerConfigHandlers() {
    // 获取配置
    ipcMain.handle(ConfigIpcHandler.get, async (_, data: GetConfigRequest) => {
        try {
            // 校验请求参数
            const validatedData = GetConfigRequestSchema.parse(data)
            return configService.getConfig(validatedData.key)
        } catch (error) {
            console.error('获取配置失败:', error)
            throw error
        }
    })

    // 更新配置（仅允许更新已存在的配置，不允许创建）
    ipcMain.handle(ConfigIpcHandler.update, async (_, data: UpdateConfigRequest) => {
        try {
            // 校验请求参数
            const validatedData = UpdateConfigRequestSchema.parse(data)
            const { key, value } = validatedData

            // 校验配置值（根据 key 对应的 schema）
            const configKey = key as ConfigKey
            const schema = ConfigSchemaMap[configKey]
            if (!schema) {
                throw new Error(`未找到配置 key "${key}" 对应的 schema`)
            }
            const validatedValue = schema.parse(value) as ConfigValueType<typeof configKey>

            // 调用业务层（只允许更新，不允许创建）
            return configService.updateConfig(configKey, validatedValue)
        } catch (error) {
            console.error('更新配置失败:', error)
            throw error
        }
    })

    // 获取所有配置
    ipcMain.handle(ConfigIpcHandler.getAll, async () => {
        try {
            return configService.getAllConfigs()
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
