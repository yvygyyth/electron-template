import type { Kysely } from 'kysely'
import type { Database } from '../index'
import { seedConfigTable } from './config'

/**
 * 种子数据执行器映射
 * key: 表名
 * value: 执行种子数据的函数
 */
const seedExecutors: Record<string, (db: Kysely<Database>) => Promise<void>> = {
    config: seedConfigTable
    // 以后可以在这里添加其他表的种子数据执行器，例如：
    // user: seedUserTable,
    // settings: seedSettingsTable
}

/**
 * 执行所有表的种子数据
 *
 * @param db 数据库实例
 */
export async function seedAllTables(db: Kysely<Database>): Promise<void> {
    for (const [tableName, executor] of Object.entries(seedExecutors)) {
        await executor(db)
        console.log(`✅ 表 "${tableName}" 的种子数据已插入`)
    }
}
