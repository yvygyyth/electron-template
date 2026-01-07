import type { ConfigHandlers } from '@main/ipc/config'
import type { IpcCall } from '@preload/modules/tool'

type ConfigIpcCall = IpcCall<ConfigHandlers>
/**
 * 类型化的 IPC invoke 方法
 * 支持根据传入的 key 参数自动推导返回类型
 */
export type IpcRendererInvoke = ConfigIpcCall
