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
    // 这里先只做数据结构转换，后续再实现执行逻辑
    const { createTable, createdTable, createIndex, createdIndex, createTrigger, createdTrigger } = useLifecycle(
        db,
        migrationData
    )

    createTable(async ({ db, tableName, columns }) => {
        // 先创建表（如果不存在）
        await createTablesFromColumns(db, tableName, columns)
    })

    createdTable(async ({ db, tableName, columns }) => {
        // 然后检查并添加缺失的列（如果表已存在）
        await addMissingColumns(db, tableName, columns)
    })

    createIndex(({ db, tableName, indexs }) => {
        createIndexFromDefinition(db, tableName, indexs)
    })

    createdIndex((ctx) => {
        //建索引后逻辑
    })

    createTrigger(({ db, tableName, triggers }) => {
        createTriggerFromDefinition(db, tableName, triggers)
    })

    createdTrigger((ctx) => {
        //建触发器后逻辑
    })

    // 插入种子数据（如果该表有定义种子数据）
    await seedAllTables(db)
}
