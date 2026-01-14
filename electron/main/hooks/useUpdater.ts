import { autoUpdater } from 'electron-updater'
import { dialog } from 'electron'

autoUpdater.autoDownload = false

// 更新可用时，弹出对话框询问是否下载
autoUpdater.on('update-available', async (info) => {
    const results = await dialog.showMessageBox({
        title: '更新可用',
        message: '有新版本可用，是否下载？',
        buttons: ['下载', '取消']
    })

    if (results.response === 0) {
        await autoUpdater.downloadUpdate()
    }
})

// 更新错误时
autoUpdater.on('error', (error) => {
    console.error(error)
})

// 监听先下载进度
autoUpdater.on('download-progress', (progress) => {
    console.log(progress)
})

export const useUpdater = () => {
    const checkForUpdates = async () => {
        try {
            await autoUpdater.checkForUpdatesAndNotify()
        } catch (error) {
            console.error(error)
        }
    }

    return {
        checkForUpdates
    }
}
