import type { IpcRendererInvoke } from '@preload/modules/invoke'
import type { IpcRendererOn } from '@preload/modules/on'

/**
 * IpcRenderer 类型定义
 */
export interface IpcRenderer {
    /** 类型化的 IPC on 方法，支持自动推断消息类型 */
    on: IpcRendererOn
    off: (...args: any[]) => any
    send: (...args: any[]) => any
    invoke: IpcRendererInvoke
}
