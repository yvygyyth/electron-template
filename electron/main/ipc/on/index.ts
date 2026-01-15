/**
 * 主进程监听渲染进程发送的消息的处理器
 *
 * 注意：根据需求，渲染进程不需要主动发送消息，所以这里暂时为空
 * 主进程通过 webContents.send 向渲染进程发送消息（如更新状态）
 *
 * 如果将来需要监听渲染进程发送的消息，可以：
 * 1. 如果只有一个模块，直接在这里添加 ipcMain.on 处理器
 * 2. 如果有多个模块，可以像 invoke 目录一样分模块管理
 */
export function registerOnHandlers(): void {
    // 目前不需要监听渲染进程发送的消息
    //
    // 如果需要添加处理器，示例：
    // import { ipcMain } from 'electron'
    // ipcMain.on('some-channel', (event, ...args) => {
    //     // 处理消息
    // })
    // 如果将来需要分模块，可以这样：
    // import { registerUpdaterOnHandlers } from './updater'
    // registerUpdaterOnHandlers()
}

/**
 * 注销所有 on 处理器
 */
export function unregisterOnHandlers(): void {
    // 清理所有监听器（如果需要）
    // import { ipcMain } from 'electron'
    // ipcMain.removeAllListeners('some-channel')
    // 如果将来需要分模块，可以这样：
    // import { unregisterUpdaterOnHandlers } from './updater'
    // unregisterUpdaterOnHandlers()
}
