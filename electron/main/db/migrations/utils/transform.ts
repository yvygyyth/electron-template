import type { TableDefinition } from '../../type'
import type { MigrationData, ColumnWithTable, IndexWithTable, TriggerWithTable } from '../types'

/**
 * 将表定义数组转换为迁移数据结构
 * 转换后的结构按照以下顺序组织：
 * 1. 表1的所有列
 * 2. 表2的所有列
 * 3. ...
 * 4. 表1的所有索引
 * 5. 表2的所有索引
 * 6. ...
 * 7. 表1的所有触发器
 * 8. 表2的所有触发器
 * 9. ...
 */
export function transformTableDefinitions(tableDefinitions: TableDefinition[]): MigrationData {
    const columns: ColumnWithTable[] = []
    const indexes: IndexWithTable[] = []
    const triggers: TriggerWithTable[] = []

    // 遍历所有表定义
    for (const tableDefinition of tableDefinitions) {
        const tableName = tableDefinition.name

        // 收集所有列
        for (const column of tableDefinition.columns) {
            columns.push({
                tableName,
                column,
                tableDefinition
            })
        }

        // 收集所有索引
        for (const index of tableDefinition.indexes) {
            indexes.push({
                tableName,
                index,
                tableDefinition
            })
        }

        // 收集所有触发器
        for (const trigger of tableDefinition.triggers) {
            triggers.push({
                tableName,
                trigger,
                tableDefinition
            })
        }
    }

    return {
        columns,
        indexes,
        triggers
    }
}
