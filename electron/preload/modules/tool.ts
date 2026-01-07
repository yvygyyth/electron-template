// 假设 ConfigHandlers 已定义
export type IpcCall<H extends Record<string, (...args: any) => any>> = <K extends keyof H>(
    type: K,
    ...args: Parameters<H[K]>
) => ReturnType<H[K]>
