import { ipcRenderer } from 'electron'

export function registerOnHandlers() {
    ipcRenderer.on('error', (_, error) => {
        console.error(error)
    })

    ipcRenderer.on('download-progress', (_, progress) => {
        console.log(progress)
    })
}

export function unregisterOnHandlers() {
    ipcRenderer.removeAllListeners('error')
    ipcRenderer.removeAllListeners('download-progress')
}
