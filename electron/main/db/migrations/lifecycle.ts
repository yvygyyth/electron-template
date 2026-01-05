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
    // 存储各个生命周期阶段的回调函数
    const createTableCallbacks: LifecycleCallback[] = []
    const createdTableCallbacks: LifecycleCallback[] = []
    const createIndexCallbacks: IndexLifecycleCallback[] = []
    const createdIndexCallbacks: IndexLifecycleCallback[] = []
    const createTriggerCallbacks: TriggerLifecycleCallback[] = []
    const createdTriggerCallbacks: TriggerLifecycleCallback[] = []

    /**
     * 注册建表前钩子
     * 设计意图：
     * - 适合执行非破坏性的操作，如创建表本身
     * - 执行时表可能存在也可能不存在，需要自行判断
     * - 一般用于新建表的场景（如果表不存在则创建）
     */
    function createTable(callback: LifecycleCallback): void {
        createTableCallbacks.push(callback)
    }

    /**
     * 注册建表后钩子
     * 设计意图：
     * - 适合执行版本相关的、可能有破坏性的操作，如删除列、修改列结构等
     * - 执行时表一定存在（在 createTable 之后执行）
     * - 一般用于表结构变更、版本迁移等场景
     */
    function createdTable(callback: LifecycleCallback): void {
        createdTableCallbacks.push(callback)
    }

    /**
     * 注册建索引前钩子
     */
    function createIndex(callback: IndexLifecycleCallback): void {
        createIndexCallbacks.push(callback)
    }

    /**
     * 注册建索引后钩子
     */
    function createdIndex(callback: IndexLifecycleCallback): void {
        createdIndexCallbacks.push(callback)
    }

    /**
     * 注册建触发器前钩子
     */
    function createTrigger(callback: TriggerLifecycleCallback): void {
        createTriggerCallbacks.push(callback)
    }

    /**
     * 注册建触发器后钩子
     */
    function createdTrigger(callback: TriggerLifecycleCallback): void {
        createdTriggerCallbacks.push(callback)
    }

    /**
     * 按顺序执行所有注册的生命周期回调
     * 确保每个步骤都等待完成后再执行下一步
     */
    async function run(): Promise<void> {
        // 1. 执行建表前钩子
        const processedTables = new Set<string>()
        for (const columnWithTable of migrationData.columns) {
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

            // 执行所有注册的 createTable 回调
            for (const callback of createTableCallbacks) {
                await callback(ctx)
            }
        }

        // 2. 执行建表后钩子
        processedTables.clear()
        for (const columnWithTable of migrationData.columns) {
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

            // 执行所有注册的 createdTable 回调
            for (const callback of createdTableCallbacks) {
                await callback(ctx)
            }
        }

        // 3. 执行建索引前钩子
        for (const indexWithTable of migrationData.indexes) {
            const ctx: IndexLifecycleContext = {
                db,
                tableName: indexWithTable.tableName,
                indexs: indexWithTable.index,
                tableDefinition: indexWithTable.tableDefinition
            }

            // 执行所有注册的 createIndex 回调
            for (const callback of createIndexCallbacks) {
                await callback(ctx)
            }
        }

        // 4. 执行建索引后钩子
        for (const indexWithTable of migrationData.indexes) {
            const ctx: IndexLifecycleContext = {
                db,
                tableName: indexWithTable.tableName,
                indexs: indexWithTable.index,
                tableDefinition: indexWithTable.tableDefinition
            }

            // 执行所有注册的 createdIndex 回调
            for (const callback of createdIndexCallbacks) {
                await callback(ctx)
            }
        }

        // 5. 执行建触发器前钩子
        for (const triggerWithTable of migrationData.triggers) {
            const ctx: TriggerLifecycleContext = {
                db,
                tableName: triggerWithTable.tableName,
                triggers: triggerWithTable.trigger,
                tableDefinition: triggerWithTable.tableDefinition
            }

            // 执行所有注册的 createTrigger 回调
            for (const callback of createTriggerCallbacks) {
                await callback(ctx)
            }
        }

        // 6. 执行建触发器后钩子
        for (const triggerWithTable of migrationData.triggers) {
            const ctx: TriggerLifecycleContext = {
                db,
                tableName: triggerWithTable.tableName,
                triggers: triggerWithTable.trigger,
                tableDefinition: triggerWithTable.tableDefinition
            }

            // 执行所有注册的 createdTrigger 回调
            for (const callback of createdTriggerCallbacks) {
                await callback(ctx)
            }
        }
    }

    return {
        /** 注册建表前钩子 */
        createTable,
        /** 注册建表后钩子 */
        createdTable,
        /** 注册建索引前钩子 */
        createIndex,
        /** 注册建索引后钩子 */
        createdIndex,
        /** 注册建触发器前钩子 */
        createTrigger,
        /** 注册建触发器后钩子 */
        createdTrigger,
        /** 按顺序执行所有注册的生命周期回调 */
        run
    }
}
