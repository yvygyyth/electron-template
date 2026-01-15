import type { UpdaterIpcMessageMap } from '@share/updater'

/**
 * IPC 消息监听器类型
 * 根据频道名称自动推断消息类型
 */
export type IpcOnListener<T extends keyof UpdaterIpcMessageMap> = UpdaterIpcMessageMap[T] extends void
    ? (event: Electron.IpcRendererEvent) => void
    : (event: Electron.IpcRendererEvent, data: UpdaterIpcMessageMap[T]) => void

/**
 * 类型化的 IPC on 方法重载
 * 支持根据传入的频道名称自动推导消息类型
 *
 * 使用示例：
 * ```typescript
 * // 方式1：使用常量（推荐）
 * window.ipcRenderer.on(UpdaterIpcEvent.updateDownloaded, (event, data) => {
 *   // data 类型自动推断为 UpdateDownloadedPayload
 * })
 *
 * // 方式2：使用字符串字面量
 * window.ipcRenderer.on("updater:update-downloaded", (event, data) => {
 *   // data 类型自动推断为 UpdateDownloadedPayload
 * })
 * ```
 */
export interface IpcRendererOn {
    // 更新器相关的类型化监听器（使用常量）
    <T extends keyof UpdaterIpcMessageMap>(channel: T, listener: IpcOnListener<T>): void
    // 更新器相关的类型化监听器（使用字符串字面量）
    <T extends keyof UpdaterIpcMessageMap>(channel: T, listener: IpcOnListener<T>): void
    // 通用监听器（用于其他频道）
    (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): void
}

/**
 * 更新器 IPC 频道名称类型
 */
export type UpdaterChannel = keyof UpdaterIpcMessageMap

/**
 * 导出更新器相关的类型和常量，供渲染进程使用
 */
export { UpdaterIpcEvent } from '@share/updater'
export type {
    UpdateAvailablePayload,
    UpdateNotAvailablePayload,
    UpdateErrorPayload,
    DownloadProgressPayload,
    UpdateDownloadedPayload,
    UpdaterIpcMessageMap
} from '@share/updater'
