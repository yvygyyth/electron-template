/**
 * IPC 处理器统一注册入口
 * 所有 IPC 处理器都在这里统一注册
 */
import { registerConfigHandlers, unregisterConfigHandlers } from './config'
import { registerWindowHandlers, unregisterWindowHandlers } from './window'

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(): void {
    registerConfigHandlers()
    registerWindowHandlers()
}

/**
 * 注销所有 IPC 处理器
 */
export function unregisterIpcHandlers(): void {
    unregisterConfigHandlers()
    unregisterWindowHandlers()
}

export type * from './config'
