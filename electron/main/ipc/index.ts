/**
 * IPC 处理器统一注册入口
 * 所有 IPC 处理器都在这里统一注册
 */
import { registerInvokeHandlers, unregisterInvokeHandlers } from './invoke'
import { registerOnHandlers, unregisterOnHandlers } from './on'

/**
 * 注册所有 IPC 处理器
 */
export function registerIpcHandlers(): void {
    registerInvokeHandlers()
    registerOnHandlers()
}

/**
 * 注销所有 IPC 处理器
 */
export function unregisterIpcHandlers(): void {
    unregisterInvokeHandlers()
    unregisterOnHandlers()
}
