/**
 * IPC invoke 处理器统一导出
 * 所有 invoke 相关的处理器都在这里统一导出
 */
import { registerConfigHandlers, unregisterConfigHandlers } from './config'
import { registerWindowHandlers, unregisterWindowHandlers } from './window'

/**
 * 注册所有 invoke IPC 处理器
 */
export function registerInvokeHandlers(): void {
    registerConfigHandlers()
    registerWindowHandlers()
}

/**
 * 注销所有 invoke IPC 处理器
 */
export function unregisterInvokeHandlers(): void {
    unregisterConfigHandlers()
    unregisterWindowHandlers()
}

export type * from './config'
