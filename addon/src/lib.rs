#![deny(clippy::all)]

use napi_derive::napi;

/// 简单的加法函数，供 Electron 主进程调用
#[napi]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// 返回问候语，用于验证 addon 是否正常加载
#[napi]
pub fn hello(name: String) -> String {
    format!("Hello, {}! From Rust addon.", name)
}
