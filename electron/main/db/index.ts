import { Kysely } from 'kysely'
import { ConfigTable } from './schema/config'
import { getDatabase as getDatabaseInstance, closeDatabase as closeDatabaseInstance } from './instance'

/**
 * 数据库接口定义
 * 这里定义所有表的结构，Kysely 会根据这个接口提供类型安全的查询
 */
export interface Database {
    config: ConfigTable
    // 以后可以在这里添加其他表，例如：
    // user: UserTable
    // settings: SettingsTable
}

/**
 * 获取数据库实例
 * 如果数据库未初始化，会自动初始化
 * 外部模块使用此函数获取数据库实例
 */
export function getDatabase(): Kysely<Database> {
    return getDatabaseInstance()
}

/**
 * 关闭数据库连接
 * 在应用退出时调用
 */
export async function closeDatabase() {
    return closeDatabaseInstance()
}

// 导出数据库类型，方便在其他地方使用
export type DB = Kysely<Database>

// 导出 schema 类型，方便外部使用
export * from './schema/config'
