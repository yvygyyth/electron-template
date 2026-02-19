# electron-builder.json5 配置说明

本文档对项目中的 `electron-builder.json5` 各配置项做简要说明，并附官方文档链接。

---

## 官方文档链接

| 文档 | 链接 |
|------|------|
| **electron-builder 官网** | https://www.electron.build/ |
| **配置总览** | https://www.electron.build/configuration |
| **NSIS 配置** | https://www.electron.build/configuration/nsis |
| **Windows 配置** | https://www.electron.build/win |
| **macOS 配置** | https://www.electron.build/mac |
| **Linux 配置** | https://www.electron.build/linux |
| **发布配置 (Publish)** | https://www.electron.build/configuration/publish |
| **自动更新** | https://www.electron.build/auto-update |

---

## 顶层配置

| 配置项 | 说明 |
|--------|------|
| `$schema` | JSON Schema 路径，用于 IDE 智能提示和校验 |
| `appId` | 应用唯一标识，macOS 对应 CFBundleIdentifier，Windows 对应 AUMID，**上线后不宜修改** |
| `asar` | 是否将应用打包为 asar 归档（默认 true），可减小体积、保护源码 |
| `productName` | 应用显示名称，可含空格和特殊字符 |
| `directories.output` | 打包产物输出目录，`${version}` 为版本号占位符 |
| `files` | 需要打包进应用的文件/目录，未列出的不会被打包 |

---

## Windows 配置 (win)

| 配置项 | 说明 |
|--------|------|
| `target` | 打包目标，如 `nsis`（安装程序）、`portable`（便携版）、`nsis-web`（在线安装） |
| `arch` | 架构，如 `x64`、`ia32`、`arm64` |
| `artifactName` | 产物的文件名模板，`${productName}`、`${version}`、`${ext}` 为占位符 |

---

## NSIS 配置 (nsis)

仅当 Windows 使用 `nsis` 目标时生效。

| 配置项 | 说明 |
|--------|------|
| `oneClick` | `true`：一键安装，支持静默更新；`false`：向导式安装，可自定义目录 |
| `perMachine` | `true`：为所有用户安装；`false`：仅为当前用户安装 |
| `allowToChangeInstallationDirectory` | 是否允许用户选择安装目录（仅 `oneClick: false` 时有效） |
| `deleteAppDataOnUninstall` | 卸载时是否删除应用数据目录 |
| `runAfterFinish` | 安装完成后是否自动启动应用 |

---

## macOS 配置 (mac)

| 配置项 | 说明 |
|--------|------|
| `target` | 打包目标，如 `dmg`、`pkg`、`zip` |
| `artifactName` | 产物的文件名模板 |
| `category` | 应用分类，如 `public.app-category.utilities`（需在 mac 下配置） |

---

## Linux 配置 (linux)

| 配置项 | 说明 |
|--------|------|
| `target` | 打包目标，如 `AppImage`、`deb`、`rpm`、`snap` |
| `artifactName` | 产物的文件名模板 |

---

## 发布配置 (publish)

用于自动更新，electron-updater 会从第一个 provider 拉取更新。

| 配置项 | 说明 |
|--------|------|
| `provider` | 发布提供商：`generic`、`github`、`s3`、`spaces`、`snap` 等 |
| `url` | 更新文件地址（generic 时必填） |
| `channel` | 更新通道，如 `latest`、`beta` |

---

## 常用占位符

| 占位符 | 含义 |
|--------|------|
| `${productName}` | 应用名称 |
| `${version}` | 版本号 |
| `${ext}` | 文件扩展名 |
| `${arch}` | 架构 |
| `${os}` | 操作系统 |

---

## 参考

- [配置示例与完整选项](https://www.electron.build/configuration)
- [electron-builder GitHub](https://github.com/electron-userland/electron-builder)
