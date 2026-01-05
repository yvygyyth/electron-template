import { ipcRenderer, contextBridge } from 'electron'
import { useLoading, domReady } from '@preload/hooks/useLoading'
import type { IpcRenderer } from '@preload/modules/index'

// --------- Expose some API to the Renderer process ---------
const ipc: IpcRenderer = {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...omit] = args
        return ipcRenderer.off(channel, ...omit)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...omit] = args
        return ipcRenderer.send(channel, ...omit)
    },
    invoke(channel, ...args) {
        return ipcRenderer.invoke(channel as any, ...args)
    }

    // You can expose other APTs you need here.
    // ...
}

contextBridge.exposeInMainWorld('ipcRenderer', ipc)

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
    ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)
