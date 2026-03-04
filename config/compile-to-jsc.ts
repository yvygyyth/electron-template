/**
 * 构建完成后：
 * 1. 生成 main/preload 的 .jsc 文件
 * 2. 执行 addon 构建（将 .jsc 嵌入 .node）
 * 3. 复制 addon/dist 到 dist-electron/addon-build
 * 4. 最后将原 .js 替换为 loader（必须在 addon 就绪后再替换，否则 Electron 启动时会找不到 addon-build）
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { compileFile } from 'bytenode'

const entries = [
    { js: 'dist-electron/main/index.js', jsc: 'dist-electron/main/index.jsc', addonFn: 'runProtectedMain' },
    { js: 'dist-electron/preload/index.js', jsc: 'dist-electron/preload/index.jsc', addonFn: 'runProtectedPreload' }
]

/** loader 内容：引入 addon-build 并调用其方法执行嵌入的 .jsc */
function getLoaderCode(addonFn: string): string {
    return `const path = require('path');
  const addon = require(path.resolve(__dirname, '../addon-build'));
  addon.${addonFn}(module);
  `;
  }

/** 判断是否为已替换的 loader 文件，避免重复编译 */
function isLoaderFile(jsPath: string): boolean {
    const content = fs.readFileSync(jsPath, 'utf-8')
    return content.includes("require(path.join(__dirname, '../addon-build')")
}

let addonBuildDone = false

/** 执行 addon 构建（用 pnpm 与项目一致，在 addon 目录下执行） */
function runAddonBuild(root: string): Promise<void> {
    const addonDir = path.join(root, 'addon')
    return new Promise((resolve, reject) => {
        const proc = spawn('pnpm', ['install'], {
            cwd: addonDir,
            shell: true,
            stdio: 'inherit'
        })
        proc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`addon pnpm install 失败，退出码: ${code}`))
                return
            }
            const buildProc = spawn('pnpm', ['run', 'build'], {
                cwd: addonDir,
                shell: true,
                stdio: 'inherit'
            })
            buildProc.on('close', (buildCode) => {
                if (buildCode === 0) resolve()
                else reject(new Error(`addon build 失败，退出码: ${buildCode}`))
            })
            buildProc.on('error', reject)
        })
        proc.on('error', reject)
    })
}

/** 复制 addon/dist 到 dist-electron/addon-build */
function copyAddonToDist(root: string): void {
    const src = path.join(root, 'addon', 'dist')
    const dest = path.join(root, 'dist-electron', 'addon-build')
    if (!fs.existsSync(src)) {
        throw new Error('addon/dist 不存在，请检查 addon 构建是否成功')
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.cpSync(src, dest, { recursive: true })
    console.log('[compile-to-jsc] 已复制 addon/dist -> dist-electron/addon-build')
}

export async function compileToJsc(): Promise<void> {
    const root = path.resolve(process.cwd())

    for (const { js, jsc, addonFn } of entries) {
        const jsPath = path.join(root, js)
        const jscPath = path.join(root, jsc)

        if (!fs.existsSync(jsPath)) {
            console.warn(`[compile-to-jsc] 跳过不存在的文件: ${js}`)
            continue
        }
        if (isLoaderFile(jsPath)) {
            continue // 已是 loader，跳过（可能被多次 closeBundle 调用）
        }

        try {
            // 1. 使用 bytenode 编译为 .jsc（针对 Electron），暂不替换 .js
            await compileFile({
                filename: jsPath,
                output: jscPath,
                electron: true,
                compileAsModule: true,
                createLoader: false
            })
            console.log(`[compile-to-jsc] 已编译: ${js} -> ${jsc}`)
        } catch (err) {
            console.error(`[compile-to-jsc] 编译失败 ${js}:`, err)
            throw err
        }
    }

    // 2. 仅当 main 和 preload 的 .jsc 都已存在且未执行过时：先构建 addon 并复制，再替换 .js
    //    （必须先完成 addon，再替换 .js 为 loader，否则 Electron 启动时会因 addon-build 不存在而报错）
    const mainJsc = path.join(root, 'dist-electron/main/index.jsc')
    const preloadJsc = path.join(root, 'dist-electron/preload/index.jsc')
    const mainJs = path.join(root, 'dist-electron/main/index.js')
    const preloadJs = path.join(root, 'dist-electron/preload/index.js')
    if (!addonBuildDone && fs.existsSync(mainJsc) && fs.existsSync(preloadJsc)) {
        addonBuildDone = true
        console.log('[compile-to-jsc] 执行 addon 构建...')
        await runAddonBuild(root)
        copyAddonToDist(root)
        // 3. addon 就绪后再替换 .js 为 loader
        if (!isLoaderFile(mainJs)) fs.writeFileSync(mainJs, getLoaderCode('runProtectedMain'), 'utf-8')
        if (!isLoaderFile(preloadJs)) fs.writeFileSync(preloadJs, getLoaderCode('runProtectedPreload'), 'utf-8')
    }
}
