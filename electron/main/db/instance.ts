import { Kysely, SqliteDialect } from 'kysely'
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'node:url'
import { app } from 'electron'
import type { Database as DatabaseInterface } from './index'
import { runMigrations } from './migrations'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 数据库实例
 * 单例模式，确保整个应用只有一个数据库连接
 */
let db: Kysely<DatabaseInterface> | null = null

/**
 * 获取数据库实例
 * 如果数据库未初始化，会自动初始化
 * 内部模块使用此函数获取数据库实例
 */
export function getDatabase(): Kysely<DatabaseInterface> {
    if (!db) {
        // 获取数据库文件路径
        // 开发环境：项目根目录
        // 生产环境：用户数据目录
        const dbPath = app.isPackaged
            ? path.join(app.getPath('userData'), 'app.db')
            : path.join(process.env.APP_ROOT || __dirname, 'app.db')

        // 创建 better-sqlite3 数据库连接
        const sqlite = new Database(dbPath)

        // 启用外键约束（如果需要）
        sqlite.pragma('foreign_keys = ON')

        // 创建 Kysely 实例
        db = new Kysely<DatabaseInterface>({
            dialect: new SqliteDialect({
                database: sqlite
            })
        })

        // 初始化数据库表结构（执行所有迁移）
        runMigrations(db).catch((error) => {
            console.error('❌ 数据库迁移失败:', error)
        })
    }

    return db
}

/**
 * 关闭数据库连接
 * 在应用退出时调用
 */
export async function closeDatabase() {
    if (db) {
        await db.destroy()
        db = null
        console.log('✅ 数据库连接已关闭')
    }
}
