import type { Kysely } from 'kysely'
import type { TableDefinition, IndexDefinition, TriggerDefinition, ColumnDefinition } from '../type'
import type { MigrationData } from './types'

/**
 * 生命周期上下文
 * 包含当前执行环境的信息
 */
export interface LifecycleContext {
    /** 数据库实例 */
    db: Kysely<any>
    /** 当前表名 */
    tableName: string
    /** 当前表的所有列定义 */
    columns: ColumnDefinition[]
    /** 完整的表定义（作为托底） */
    tableDefinition: TableDefinition
}

/**
 * 索引生命周期上下文
 */
export interface IndexLifecycleContext {
    /** 数据库实例 */
    db: Kysely<any>
    /** 当前表名 */
    tableName: string
    /** 当前索引定义 */
    indexs: IndexDefinition
    /** 当前表定义 */
    tableDefinition: TableDefinition
}

/**
 * 触发器生命周期上下文
 */
export interface TriggerLifecycleContext {
    /** 数据库实例 */
    db: Kysely<any>
    /** 当前表名 */
    tableName: string
    /** 当前触发器定义 */
    triggers: TriggerDefinition
    /** 当前表定义 */
    tableDefinition: TableDefinition
}

/**
 * 生命周期回调函数类型定义
 */
export type LifecycleCallback = (ctx: LifecycleContext) => Promise<void> | void
export type IndexLifecycleCallback = (ctx: IndexLifecycleContext) => Promise<void> | void
export type TriggerLifecycleCallback = (ctx: TriggerLifecycleContext) => Promise<void> | void

/**
 * 组合式生命周期函数
 * 只负责决定执行顺序，具体实现由外部传入
 *
 * @param db 数据库实例
 * @param migrationData 迁移数据
 * @returns 生命周期方法集合
 */
export function useLifecycle(db: Kysely<any>, migrationData: MigrationData) {
    /**
     * 执行建表前钩子
     * 自动遍历所有表，对每个表执行回调
     *
     * 设计意图：
     * - 适合执行非破坏性的操作，如创建表本身
     * - 执行时表可能存在也可能不存在，需要自行判断
     * - 一般用于新建表的场景（如果表不存在则创建）
     */
    async function createTable(callback: LifecycleCallback): Promise<void> {
        const processedTables = new Set<string>()
        for (const columnWithTable of migrationData.columns) {
            // 如果这个表已经处理过，跳过
            if (processedTables.has(columnWithTable.tableName)) {
                continue
            }
            processedTables.add(columnWithTable.tableName)

            const ctx: LifecycleContext = {
                db,
                tableName: columnWithTable.tableName,
                columns: columnWithTable.tableDefinition.columns,
                tableDefinition: columnWithTable.tableDefinition
            }
            await callback(ctx)
        }
    }

    /**
     * 执行建表后钩子
     * 自动遍历所有表，对每个表执行回调
     *
     * 设计意图：
     * - 适合执行版本相关的、可能有破坏性的操作，如删除列、修改列结构等
     * - 执行时表一定存在（在 createTable 之后执行）
     * - 一般用于表结构变更、版本迁移等场景
     */
    async function createdTable(callback: LifecycleCallback): Promise<void> {
        const processedTables = new Set<string>()
        for (const columnWithTable of migrationData.columns) {
            // 如果这个表已经处理过，跳过
            if (processedTables.has(columnWithTable.tableName)) {
                continue
            }
            processedTables.add(columnWithTable.tableName)

            const ctx: LifecycleContext = {
                db,
                tableName: columnWithTable.tableName,
                columns: columnWithTable.tableDefinition.columns,
                tableDefinition: columnWithTable.tableDefinition
            }
            await callback(ctx)
        }
    }

    /**
     * 执行建索引前钩子
     * 自动遍历所有索引，对每个索引执行回调
     */
    async function createIndex(callback: IndexLifecycleCallback): Promise<void> {
        for (const indexWithTable of migrationData.indexes) {
            const ctx: IndexLifecycleContext = {
                db,
                tableName: indexWithTable.tableName,
                indexs: indexWithTable.index,
                tableDefinition: indexWithTable.tableDefinition
            }
            await callback(ctx)
        }
    }

    /**
     * 执行建索引后钩子
     * 自动遍历所有索引，对每个索引执行回调
     */
    async function createdIndex(callback: IndexLifecycleCallback): Promise<void> {
        for (const indexWithTable of migrationData.indexes) {
            const ctx: IndexLifecycleContext = {
                db,
                tableName: indexWithTable.tableName,
                indexs: indexWithTable.index,
                tableDefinition: indexWithTable.tableDefinition
            }
            await callback(ctx)
        }
    }

    /**
     * 执行建触发器前钩子
     * 自动遍历所有触发器，对每个触发器执行回调
     */
    async function createTrigger(callback: TriggerLifecycleCallback): Promise<void> {
        for (const triggerWithTable of migrationData.triggers) {
            const ctx: TriggerLifecycleContext = {
                db,
                tableName: triggerWithTable.tableName,
                triggers: triggerWithTable.trigger,
                tableDefinition: triggerWithTable.tableDefinition
            }
            await callback(ctx)
        }
    }

    /**
     * 执行建触发器后钩子
     * 自动遍历所有触发器，对每个触发器执行回调
     */
    async function createdTrigger(callback: TriggerLifecycleCallback): Promise<void> {
        for (const triggerWithTable of migrationData.triggers) {
            const ctx: TriggerLifecycleContext = {
                db,
                tableName: triggerWithTable.tableName,
                triggers: triggerWithTable.trigger,
                tableDefinition: triggerWithTable.tableDefinition
            }
            await callback(ctx)
        }
    }

    return {
        /** 执行建表前钩子 */
        createTable,
        /** 执行建表后钩子 */
        createdTable,
        /** 执行建索引前钩子 */
        createIndex,
        /** 执行建索引后钩子 */
        createdIndex,
        /** 执行建触发器前钩子 */
        createTrigger,
        /** 执行建触发器后钩子 */
        createdTrigger
    }
}
