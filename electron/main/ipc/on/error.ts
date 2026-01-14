import { ipcRenderer } from 'electron'

export function registerErrorHandlers() {
    ipcRenderer.on('error', (_, error) => {
        console.error(error)
    })
}

export function unregisterErrorHandlers() {
    ipcRenderer.removeAllListeners('error')
}
