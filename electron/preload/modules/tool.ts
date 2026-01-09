export type IpcCall<H extends Record<PropertyKey, (...args: any) => any>> = <C extends keyof H>(
    channel: C,
    ...args: Parameters<H[C]>
) => ReturnType<H[C]>
