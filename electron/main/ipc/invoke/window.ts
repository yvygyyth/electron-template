import { BrowserWindow, ipcMain } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 窗口相关的 IPC 处理器
 */
export function registerWindowHandlers() {
    // 打开新窗口示例
    ipcMain.handle('open-win', (_, arg: string) => {
        const preload = path.join(__dirname, '../preload/index.js')
        const RENDERER_DIST = path.join(process.env.APP_ROOT || '', 'dist')
        const indexHtml = path.join(RENDERER_DIST, 'index.html')
        const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

        const childWindow = new BrowserWindow({
            webPreferences: {
                preload,
                nodeIntegration: true,
                contextIsolation: false
            }
        })

        if (VITE_DEV_SERVER_URL) {
            childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
        } else {
            childWindow.loadFile(indexHtml, { hash: arg })
        }
    })
}

/**
 * 注销窗口相关的 IPC 处理器
 */
export function unregisterWindowHandlers() {
    ipcMain.removeHandler('open-win')
}
