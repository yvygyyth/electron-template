import { autoUpdater } from 'electron-updater'
import { dialog, BrowserWindow } from 'electron'
import {
    UpdaterIpcEvent,
    type UpdateAvailablePayload,
    type UpdateNotAvailablePayload,
    type UpdateErrorPayload,
    type DownloadProgressPayload,
    type UpdateDownloadedPayload
} from '@share/updater'

autoUpdater.autoDownload = false

// 更新相关的 IPC 频道名称（保持向后兼容，实际使用 UpdaterIpcEvent）
export const UPDATER_CHANNELS = {
    UPDATE_AVAILABLE: UpdaterIpcEvent.updateAvailable,
    UPDATE_NOT_AVAILABLE: UpdaterIpcEvent.updateNotAvailable,
    UPDATE_ERROR: UpdaterIpcEvent.updateError,
    DOWNLOAD_PROGRESS: UpdaterIpcEvent.downloadProgress,
    UPDATE_DOWNLOADED: UpdaterIpcEvent.updateDownloaded,
    CHECKING_FOR_UPDATE: UpdaterIpcEvent.checkingForUpdate
} as const

/**
 * 初始化自动更新器
 * @param win BrowserWindow 实例，用于向渲染进程发送消息
 */
export const useUpdater = (win: BrowserWindow | null) => {
    // 检查更新中
    autoUpdater.on('checking-for-update', () => {
        console.log('正在检查更新...')
        win?.webContents.send(UpdaterIpcEvent.checkingForUpdate)
    })

    // 更新可用时，弹出对话框询问是否下载
    autoUpdater.on('update-available', async (info) => {
        console.log('发现新版本:', info.version)

        // 处理 releaseNotes，可能是字符串或数组
        const releaseNotes = Array.isArray(info.releaseNotes)
            ? info.releaseNotes.map((note) => (typeof note === 'string' ? note : note.note || '')).join('\n')
            : info.releaseNotes || ''

        // 向渲染进程发送更新可用消息
        const updateAvailablePayload: UpdateAvailablePayload = {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: releaseNotes
        }
        win?.webContents.send(UpdaterIpcEvent.updateAvailable, updateAvailablePayload)

        // 使用 dialog 询问用户是否下载
        const results = await dialog.showMessageBox(win!, {
            type: 'info',
            title: '更新可用',
            message: `发现新版本 ${info.version}，是否下载？`,
            detail: releaseNotes || '新版本已发布，建议更新以获得更好的体验。',
            buttons: ['下载', '取消'],
            defaultId: 0,
            cancelId: 1
        })

        if (results.response === 0) {
            // 用户选择下载
            await autoUpdater.downloadUpdate()
        }
    })

    // 没有可用更新
    autoUpdater.on('update-not-available', (info) => {
        console.log('当前已是最新版本:', info.version)
        const updateNotAvailablePayload: UpdateNotAvailablePayload = {
            version: info.version
        }
        win?.webContents.send(UpdaterIpcEvent.updateNotAvailable, updateNotAvailablePayload)
    })

    // 更新错误时
    autoUpdater.on('error', (error) => {
        console.error('更新检查失败:', error)
        const updateErrorPayload: UpdateErrorPayload = {
            message: error.message,
            stack: error.stack
        }
        win?.webContents.send(UpdaterIpcEvent.updateError, updateErrorPayload)
    })

    // 监听下载进度
    autoUpdater.on('download-progress', (progress) => {
        console.log('下载进度:', progress.percent)
        const downloadProgressPayload: DownloadProgressPayload = {
            percent: progress.percent,
            transferred: progress.transferred,
            total: progress.total,
            bytesPerSecond: progress.bytesPerSecond
        }
        win?.webContents.send(UpdaterIpcEvent.downloadProgress, downloadProgressPayload)
    })

    // 更新下载完成
    autoUpdater.on('update-downloaded', (info) => {
        console.log('更新下载完成:', info.version)

        // 处理 releaseNotes，可能是字符串或数组
        const releaseNotes = Array.isArray(info.releaseNotes)
            ? info.releaseNotes.map((note) => (typeof note === 'string' ? note : note.note || '')).join('\n')
            : info.releaseNotes || ''

        const updateDownloadedPayload: UpdateDownloadedPayload = {
            version: info.version,
            releaseDate: info.releaseDate,
            releaseNotes: releaseNotes
        }
        win?.webContents.send(UpdaterIpcEvent.updateDownloaded, updateDownloadedPayload)

        // 使用 dialog 询问用户是否重启应用
        dialog
            .showMessageBox(win!, {
                type: 'info',
                title: '更新下载完成',
                message: `版本 ${info.version} 下载完成，是否立即重启应用？`,
                detail: '应用将在重启后应用更新。',
                buttons: ['立即重启', '稍后重启'],
                defaultId: 0,
                cancelId: 1
            })
            .then((results) => {
                if (results.response === 0) {
                    // 用户选择立即重启
                    autoUpdater.quitAndInstall(false, true)
                }
            })
    })

    /**
     * 检查更新
     */
    const checkForUpdates = async () => {
        try {
            await autoUpdater.checkForUpdates()
        } catch (error) {
            console.error('检查更新失败:', error)
        }
    }

    return {
        checkForUpdates
    }
}
