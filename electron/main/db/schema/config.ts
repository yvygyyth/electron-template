import { Generated } from 'kysely'
import type { ConfigKey } from '@share/index'
import type { ColumnDefinition, IndexDefinition, TriggerDefinition, TableDefinition } from '../type'

/**
 * Config 表结构定义
 *
 * - key 字段：接受所有 ConfigKey 类型
 * - value 字段：接受所有可能的配置值类型的联合类型（ConfigValueType<ConfigKey>）
 */
export interface ConfigTable {
    id: Generated<number>

    /** 唯一配置 key */
    key: ConfigKey

    /** JSON 配置内容（所有可能的配置值类型的联合） */
    value: string

    /** 配置说明 */
    description: string | null

    /** 创建时间 */
    created_at: number

    /** 更新时间 */
    updated_at: number
}

/**
 * Config 表的列定义数组
 * 通过数组定义表结构，更加声明式和易于维护
 */
export const configTableColumns: ColumnDefinition[] = [
    { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true },
    { name: 'key', type: 'text', notNull: true, unique: true },
    { name: 'value', type: 'text', notNull: true }, // SQLite 中 JSON 存储为 TEXT
    { name: 'description', type: 'text' },
    { name: 'created_at', type: 'integer', notNull: true },
    { name: 'updated_at', type: 'integer', notNull: true }
]

/**
 * Config 表的索引定义数组
 */
export const configTableIndexes: IndexDefinition[] = [
    // 示例：为 key 字段创建索引（虽然已经有 unique 约束，但可以添加额外索引）
    // { name: 'idx_config_key', table: 'config', columns: 'key' },
    // 示例：为 created_at 创建索引，方便按时间查询
    { name: 'idx_config_created_at', table: 'config', columns: 'created_at' }
]

/**
 * Config 表的触发器定义数组
 */
export const configTableTriggers: TriggerDefinition[] = [
    // INSERT 触发器：自动设置 created_at 和 updated_at
    // 在插入之前，如果 created_at 或 updated_at 为空或为 0，则自动设置为当前时间戳
    {
        name: 'trigger_config_insert_timestamps',
        table: 'config',
        timing: 'BEFORE',
        event: 'INSERT',
        sql: "UPDATE config SET created_at = CASE WHEN NEW.created_at IS NULL OR NEW.created_at = 0 THEN CAST(strftime('%s', 'now') AS INTEGER) ELSE NEW.created_at END, updated_at = CASE WHEN NEW.updated_at IS NULL OR NEW.updated_at = 0 THEN CAST(strftime('%s', 'now') AS INTEGER) ELSE NEW.updated_at END WHERE rowid = NEW.rowid;"
    },
    // UPDATE 触发器：自动更新 updated_at（不修改 created_at）
    {
        name: 'trigger_config_update_timestamp',
        table: 'config',
        timing: 'BEFORE',
        event: 'UPDATE',
        sql: "UPDATE config SET updated_at = CAST(strftime('%s', 'now') AS INTEGER) WHERE rowid = NEW.rowid;"
    }
]

/**
 * Config 表的完整定义
 * 包含列、索引、触发器以及依赖关系
 */
export const configTableDefinition: TableDefinition = {
    name: 'config',
    columns: configTableColumns,
    indexes: configTableIndexes,
    triggers: configTableTriggers
}
