# Electron 踩坑记录 - Rust 原生 Addon

## 使用 napi-rs 在 Electron 中调用 Rust

### 前置条件

- 安装 Rust 环境：<https://rustup.rs/>
- 安装 Node.js（用于构建 addon）

### 构建步骤

1. **构建 addon**
   ```bash
   cd addon
   npm install
   npm run build
   ```

2. **Electron 中调用**（主进程需用绝对路径加载）

   pnpm 的 `file:` 依赖可能无法正确解析，`require('addon')` 会报 `Cannot find module 'addon'`。  
   **解决：** 使用绝对路径直接加载 addon 目录，不依赖 node_modules：

   ```javascript
   const path = require('path')
   const addonPath = path.join(process.env.APP_ROOT, 'addon')
   const addon = require(addonPath)
   addon.add(1, 2)      // 3
   addon.hello('World') // "Hello, World! From Rust addon."
   ```

3. **Electron 版本与 .node 文件**

   **需要。** `napi build` 默认用系统 Node.js 编译，而 Electron 内嵌自己的 Node（且使用 BoringSSL 等，ABI 与系统 Node 不同）。若版本/ABI 不一致，加载时会报错（如 `Error: The module was compiled against a different Node.js version`）。

   **处理方式：**
   - 尽量用与 Electron 内嵌 Node 相同或接近的 Node 版本构建（可用 nvm 切换）
   - 升级 Electron 后，需重新执行 `cd addon && npm run build`
   - `electron-rebuild` 主要针对 node-gyp 模块，对 napi-rs（Rust）支持有限

### 本地测试

在 addon 目录下运行 `node test.js` 可单独测试 addon 是否正常：

```bash
cd addon
node test.js
```

### 相关链接

- [napi-rs 文档](https://napi.rs/)
- [Electron 原生模块](https://www.electronjs.org/docs/latest/tutorial/native-code-and-electron)
