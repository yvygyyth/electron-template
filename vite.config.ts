import fs from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import pkg from './package.json'
import path from 'node:path'

// https://vitejs.dev/config/
// Vite 配置文件
export default defineConfig(({ command }) => {
    fs.rmSync('dist-electron', { recursive: true, force: true })

    const isServe = command === 'serve'
    const isBuild = command === 'build'
    const sourcemap = isServe || !!process.env.VSCODE_DEBUG

    return {
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@main': path.resolve(__dirname, 'electron/main'),
                '@preload': path.resolve(__dirname, 'electron/preload'),
                '@share': path.resolve(__dirname, 'electron/share')
            }
        },
        plugins: [
            vue(),
            electron([
                {
                    entry: 'electron/main/index.ts',
                    onstart({ startup }) {
                        if (process.env.VSCODE_DEBUG) {
                            console.log(/* 用于 `.vscode/.debug.script.mjs` */ '[startup] Electron App')
                        } else {
                            startup()
                        }
                    },
                    vite: {
                        resolve: {
                            alias: {
                                '@main': path.resolve(__dirname, 'electron/main'),
                                '@share': path.resolve(__dirname, 'electron/share')
                            }
                        },
                        build: {
                            sourcemap,
                            minify: isBuild,
                            outDir: 'dist-electron/main',
                            rollupOptions: {
                                // 一些第三方 Node.js 库可能无法被 Vite 正确构建，特别是 `C/C++` 插件，
                                // 我们可以使用 `external` 来排除它们以确保它们能正常工作。
                                // 其他的需要将它们放在 `dependencies` 中，以确保在应用构建后它们被收集到 `app.asar` 中。
                                // 当然，这不是绝对的，只是这种方式相对简单。:)
                                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
                            }
                        }
                    }
                },
                {
                    entry: 'electron/preload/index.ts',
                    onstart({ reload }) {
                        // Notify the Renderer process to reload the page when the Preload scripts build is complete,
                        // instead of restarting the entire Electron App.
                        reload()
                    },
                    vite: {
                        resolve: {
                            alias: {
                                '@main': path.resolve(__dirname, 'electron/main'),
                                '@preload': path.resolve(__dirname, 'electron/preload'),
                                '@share': path.resolve(__dirname, 'electron/share')
                            }
                        },
                        build: {
                            sourcemap: sourcemap ? 'inline' : undefined, // #332 内联 sourcemap
                            minify: isBuild,
                            outDir: 'dist-electron/preload',
                            rollupOptions: {
                                external: Object.keys('dependencies' in pkg ? pkg.dependencies : {})
                            }
                        }
                    }
                }
            ])
        ],
        server:
            process.env.VSCODE_DEBUG &&
            (() => {
                const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
                return {
                    host: url.hostname,
                    port: +url.port
                }
            })(),
        clearScreen: false
    }
})
