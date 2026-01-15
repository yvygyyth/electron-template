/**
 * 更新器模块
 * 定义主进程发送给渲染进程的所有更新相关消息类型
 */

// ==================== IPC 频道名称 ====================

/**
 * 更新器相关的 IPC 频道名称
 */
export const UpdaterIpcEvent = {
    /** 正在检查更新 */
    checkingForUpdate: 'updater:checking-for-update',
    /** 更新可用 */
    updateAvailable: 'updater:update-available',
    /** 更新不可用（已是最新版本） */
    updateNotAvailable: 'updater:update-not-available',
    /** 更新错误 */
    updateError: 'updater:error',
    /** 下载进度 */
    downloadProgress: 'updater:download-progress',
    /** 更新下载完成 */
    updateDownloaded: 'updater:update-downloaded'
} as const

// ==================== 消息数据类型 ====================

/**
 * 更新可用时的数据
 */
export interface UpdateAvailablePayload {
    /** 版本号 */
    version: string
    /** 发布日期 */
    releaseDate?: string
    /** 发布说明（已处理为字符串） */
    releaseNotes: string
}

/**
 * 更新不可用时的数据（已是最新版本）
 */
export interface UpdateNotAvailablePayload {
    /** 当前版本号 */
    version: string
}

/**
 * 更新错误时的数据
 */
export interface UpdateErrorPayload {
    /** 错误消息 */
    message: string
    /** 错误堆栈 */
    stack?: string
}

/**
 * 下载进度数据
 */
export interface DownloadProgressPayload {
    /** 下载进度百分比（0-100） */
    percent: number
    /** 已传输的字节数 */
    transferred: number
    /** 总字节数 */
    total: number
    /** 下载速度（字节/秒） */
    bytesPerSecond: number
}

/**
 * 更新下载完成时的数据
 */
export interface UpdateDownloadedPayload {
    /** 版本号 */
    version: string
    /** 发布日期 */
    releaseDate?: string
    /** 发布说明（已处理为字符串） */
    releaseNotes: string
}

// ==================== 类型映射 ====================

/**
 * 更新器 IPC 消息类型映射
 * 用于类型推断和类型安全
 * 键是频道名称，值是对应的消息数据类型
 *
 * 渲染进程可以通过以下方式使用，类型会自动推断：
 * ```typescript
 * import { UpdaterIpcEvent } from '@share/index'
 *
 * window.ipcRenderer.on(UpdaterIpcEvent.updateDownloaded, (event, data) => {
 *   // data 类型自动推断为 UpdateDownloadedPayload
 *   console.log(data.version)
 * })
 * ```
 */
export interface UpdaterIpcMessageMap {
    [UpdaterIpcEvent.checkingForUpdate]: void
    [UpdaterIpcEvent.updateAvailable]: UpdateAvailablePayload
    [UpdaterIpcEvent.updateNotAvailable]: UpdateNotAvailablePayload
    [UpdaterIpcEvent.updateError]: UpdateErrorPayload
    [UpdaterIpcEvent.downloadProgress]: DownloadProgressPayload
    [UpdaterIpcEvent.updateDownloaded]: UpdateDownloadedPayload
}

/**
 * 根据频道名称获取对应的消息类型
 */
export type UpdaterIpcMessageType<T extends keyof UpdaterIpcMessageMap> = UpdaterIpcMessageMap[T]
