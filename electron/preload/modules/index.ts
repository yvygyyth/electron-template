import type { IpcRendererInvoke } from '@preload/modules/invoke'

/**
 * IpcRenderer 类型定义
 */
export interface IpcRenderer {
    on: (...args: any[]) => any
    off: (...args: any[]) => any
    send: (...args: any[]) => any
    invoke: IpcRendererInvoke
}
