import { UpdaterIpcEvent } from '@share/index'
import type {
    UpdateAvailablePayload,
    UpdateNotAvailablePayload,
    UpdateErrorPayload,
    DownloadProgressPayload,
    UpdateDownloadedPayload
} from '@share/index'

/**
 * 格式化字节数为可读格式
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * 格式化下载速度
 */
function formatSpeed(bytesPerSecond: number): string {
    return formatBytes(bytesPerSecond) + '/s'
}

/**
 * 更新器 hooks
 * 监听主进程发送的更新相关消息并打印日志
 */
export function useUpdater() {
    window.ipcRenderer.on(UpdaterIpcEvent.checkingForUpdate, () => {
        console.log('[Updater] 🔍 正在检查更新...')
    })

    window.ipcRenderer.on(UpdaterIpcEvent.updateAvailable, (_event: unknown, data: UpdateAvailablePayload) => {
        console.log('[Updater] ✨ 发现新版本:', {
            版本号: data.version,
            发布日期: data.releaseDate || '未知',
            更新说明: data.releaseNotes || '无'
        })
    })

    window.ipcRenderer.on(UpdaterIpcEvent.updateNotAvailable, (_event: unknown, data: UpdateNotAvailablePayload) => {
        console.log('[Updater] ✅ 当前已是最新版本:', {
            版本号: data.version
        })
    })

    window.ipcRenderer.on(UpdaterIpcEvent.updateError, (_event: unknown, data: UpdateErrorPayload) => {
        console.error('[Updater] ❌ 更新检查失败:', {
            错误消息: data.message,
            错误堆栈: data.stack || '无'
        })
    })

    window.ipcRenderer.on(UpdaterIpcEvent.downloadProgress, (_event: unknown, data: DownloadProgressPayload) => {
        const transferred = formatBytes(data.transferred)
        const total = formatBytes(data.total)
        const speed = formatSpeed(data.bytesPerSecond)
        console.log(`[Updater] 📥 下载进度: ${data.percent.toFixed(2)}% (${transferred} / ${total}) - ${speed}`)
    })

    window.ipcRenderer.on(UpdaterIpcEvent.updateDownloaded, (_event: unknown, data: UpdateDownloadedPayload) => {
        console.log('[Updater] 🎉 更新下载完成:', {
            版本号: data.version,
            发布日期: data.releaseDate || '未知',
            更新说明: data.releaseNotes || '无'
        })
    })
}
