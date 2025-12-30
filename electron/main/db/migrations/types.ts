import type { TableDefinition, ColumnDefinition, IndexDefinition, TriggerDefinition } from '../type'

/**
 * 带表名的列定义
 */
export interface ColumnWithTable {
    /** 表名 */
    tableName: string
    /** 列定义 */
    column: ColumnDefinition
    /** 表定义（用于上下文） */
    tableDefinition: TableDefinition
}

/**
 * 带表名的索引定义
 */
export interface IndexWithTable {
    /** 表名 */
    tableName: string
    /** 索引定义 */
    index: IndexDefinition
    /** 表定义（用于上下文） */
    tableDefinition: TableDefinition
}

/**
 * 带表名的触发器定义
 */
export interface TriggerWithTable {
    /** 表名 */
    tableName: string
    /** 触发器定义 */
    trigger: TriggerDefinition
    /** 表定义（用于上下文） */
    tableDefinition: TableDefinition
}

/**
 * 转换后的迁移数据结构
 * 按照：所有表的列 → 所有表的索引 → 所有表的触发器 的顺序组织
 */
export interface MigrationData {
    /** 所有表的列（按表顺序排列） */
    columns: ColumnWithTable[]
    /** 所有表的索引（按表顺序排列） */
    indexes: IndexWithTable[]
    /** 所有表的触发器（按表顺序排列） */
    triggers: TriggerWithTable[]
}
