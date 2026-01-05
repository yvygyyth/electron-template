import type { Kysely } from 'kysely'
import { configTableDefinition } from '../schema/config'
import { transformTableDefinitions } from './utils/transform'
import { createTablesFromColumns } from './utils/create-table'
import { addMissingColumns } from './utils/add-columns'
import { createIndexFromDefinition } from './utils/create-index'
import { createTriggerFromDefinition } from './utils/create-trigger'
import { useLifecycle } from './lifecycle'
import { seedAllTables } from '../seeds'

const tableDefinitions = [configTableDefinition]

// 转换数据结构
const migrationData = transformTableDefinitions(tableDefinitions)

export const runMigrations = async (db: Kysely<any>) => {
    const { createTable, createdTable, createIndex, createdIndex, createTrigger, createdTrigger, run } = useLifecycle(
        db,
        migrationData
    )

    // 注册建表前钩子：创建表（如果不存在）
    createTable(({ db, tableName, columns }) => createTablesFromColumns(db, tableName, columns))

    // 注册建表后钩子：检查并添加缺失的列
    createdTable(({ db, tableName, columns }) => addMissingColumns(db, tableName, columns))

    // 注册建索引前钩子：创建索引
    createIndex(({ db, tableName, indexs }) => createIndexFromDefinition(db, tableName, indexs))

    // 注册建索引后钩子
    createdIndex((ctx) => {
        //建索引后逻辑
    })

    // 注册建触发器前钩子：创建触发器
    createTrigger(({ db, tableName, triggers }) => createTriggerFromDefinition(db, tableName, triggers))

    // 注册建触发器后钩子
    createdTrigger((ctx) => {
        //建触发器后逻辑
    })

    // 按顺序执行所有注册的生命周期回调
    await run()

    // 插入种子数据（如果该表有定义种子数据）
    await seedAllTables(db)
}
