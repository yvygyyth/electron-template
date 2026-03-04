# Electron 踩坑记录 - JSC 字节码打包

## 将 main/preload 编译为 .jsc 供 Rust 等使用

### 配置文件（config/）

- `vite.config.ts`：普通模式，输出 .js
- `vite.config.jsc.ts`：JSC 模式，dev/build 均生成 .jsc

### 命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 普通开发，输出 .js |
| `pnpm dev:jsc` | JSC 开发，输出 .jsc |
| `pnpm build` | 普通打包 |
| `pnpm build:jsc` | JSC 打包 |
| `pnpm build:win` | Windows 普通打包 |
| `pnpm build:win:jsc` | Windows JSC 打包 |

### 流程

1. `vite build` 输出 `dist-electron/main/index.js`、`dist-electron/preload/index.js`
2. `compile-to-jsc.mjs` 使用 bytenode 针对 Electron 编译为 `.jsc`
3. 原 `.js` 被替换为 loader（负责 `require('bytenode')` 并加载 `.jsc`）
4. 入口路径不变，`package.json` main 仍为 `dist-electron/main/index.js`

### 依赖

- `bytenode`：运行时加载 `.jsc`，需在 `dependencies` 中

### 注意事项

- preload 若输出 `index.mjs`，需在 `config/compile-to-jsc.ts` 的 `entries` 中增加对应项，并修改 main 进程的 preload 路径
- 依赖 `Function.prototype.toString` 的代码可能异常（bytenode 限制）
- 箭头函数在部分场景可能有问题，建议优先使用普通函数

### 进程未关闭导致无法删除 release 目录

打包后运行应用若报错，进程可能未完全退出，导致 `release` 目录或相关文件被占用、无法删除。可在 CMD 或 PowerShell 中执行以下命令清理：

```cmd
taskkill /F /IM electron.exe 2>nul
taskkill /F /IM YourAppName.exe 2>nul
taskkill /F /IM node.exe 2>nul
taskkill /F /IM app-builder.exe 2>nul
```

若仍无法删除，可先结束占用进程后重试：

```cmd
taskkill /F /IM electron.exe
taskkill /F /IM node.exe
taskkill /F /IM app-builder.exe
rd /s /q release
```

### 相关链接

- [bytenode](https://github.com/bytenode/bytenode)
- [electron-bytenode-example](https://github.com/spaceagetv/electron-bytenode-example)
