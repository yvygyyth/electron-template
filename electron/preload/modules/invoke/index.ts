import type { GetConfigRequest, UpdateConfigRequest, GetConfigResponse, GetAllConfigResponse } from '@share/index'
import type { ConfigIpcHandler } from '@main/ipc/config'

/**
 * IPC Channel 到请求/响应类型的映射
 */
export interface IpcChannelMap {
    // 配置相关
    [ConfigIpcHandler.get]: {
        request: GetConfigRequest
        response: GetConfigResponse
    }
    [ConfigIpcHandler.update]: {
        request: UpdateConfigRequest
        response: GetConfigResponse
    }
    [ConfigIpcHandler.getAll]: {
        request: void
        response: GetAllConfigResponse
    }
}

/**
 * 类型化的 IPC invoke 方法
 */
export type IpcRendererInvoke = {
    <Channel extends keyof IpcChannelMap>(
        channel: Channel,
        ...args: IpcChannelMap[Channel]['request'] extends void ? [] : [IpcChannelMap[Channel]['request']]
    ): Promise<IpcChannelMap[Channel]['response']>
}
