import { ipcMain } from 'electron'
import { configRepository } from '../db/repositories/config'

/**
 * 配置相关的 IPC 处理器
 */
export function registerConfigHandlers() {
    // 获取配置
    ipcMain.handle('config:get', async (_, key: string) => {
        try {
            return await configRepository.getByKey(key)
        } catch (error) {
            console.error('获取配置失败:', error)
            throw error
        }
    })

    // 创建或更新配置
    ipcMain.handle('config:upsert', async (_, config: { key: string; value: any; description?: string | null }) => {
        try {
            return await configRepository.upsert({
                key: config.key,
                value: config.value,
                description: config.description ?? null
            })
        } catch (error) {
            console.error('创建或更新配置失败:', error)
            throw error
        }
    })

    // 删除配置
    ipcMain.handle('config:delete', async (_, key: string) => {
        try {
            return await configRepository.delete(key)
        } catch (error) {
            console.error('删除配置失败:', error)
            throw error
        }
    })

    // 获取所有配置
    ipcMain.handle('config:getAll', async () => {
        try {
            return await configRepository.getAll()
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
    ipcMain.removeHandler('config:get')
    ipcMain.removeHandler('config:upsert')
    ipcMain.removeHandler('config:delete')
    ipcMain.removeHandler('config:getAll')
}
