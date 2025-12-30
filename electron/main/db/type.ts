/**
 * SQLite 列类型
 */
export type ColumnType = 'integer' | 'text' | 'real' | 'blob'

export type ColumnValueMap = {
    integer: number
    text: string
    real: number
    blob: Buffer
}

/**
 * 外键删除/更新行为（小写，匹配 Kysely API）
 * - cascade: 级联删除/更新（删除/更新父表记录时，自动删除/更新子表记录）
 * - set null: 设置为 NULL（删除/更新父表记录时，将子表外键设置为 NULL）
 * - restrict: 限制删除/更新（如果子表有引用，禁止删除/更新父表记录）
 * - no action: 不执行任何操作（等同于 restrict）
 */
export type ForeignKeyAction = 'cascade' | 'set null' | 'restrict' | 'no action'

/**
 * 外键约束定义
 *
 * @example
 * ```typescript
 * // 引用 user 表的 id 列，删除时级联删除，更新时限制更新
 * {
 *   table: 'user',
 *   column: 'id',
 *   onDelete: 'cascade',
 *   onUpdate: 'restrict'
 * }
 * ```
 */
export interface ForeignKeyDefinition {
    /** 引用的表名 */
    table: string
    /** 引用的列名（默认为 'id'） */
    column?: string
    /** 删除时的行为（默认为 'restrict'） */
    onDelete?: ForeignKeyAction
    /** 更新时的行为（默认为 'restrict'） */
    onUpdate?: ForeignKeyAction
}

/**
 * 列定义接口
 *
 * @example
 * ```typescript
 * // 普通列
 * { name: 'name', type: 'text', notNull: true }
 *
 * // 主键列
 * { name: 'id', type: 'integer', primaryKey: true, autoIncrement: true }
 *
 * // 外键列
 * {
 *   name: 'user_id',
 *   type: 'integer',
 *   notNull: true,
 *   foreignKey: { table: 'user', column: 'id', onDelete: 'cascade' }
 * }
 * ```
 */
export interface ColumnDefinition<T extends ColumnType = ColumnType> {
    /** 列名 */
    name: string
    /** 列类型 */
    type: T
    /** 是否为主键 */
    primaryKey?: boolean
    /** 是否自增（仅 integer 类型有效） */
    autoIncrement?: T extends 'integer' ? boolean : never
    /** 是否非空 */
    notNull?: boolean
    /** 是否唯一 */
    unique?: boolean
    /** 默认值 */
    defaultValue?: ColumnValueMap[T]
    /** 外键约束定义 */
    foreignKey?: ForeignKeyDefinition
}

/**
 * 索引定义接口
 *
 * @example
 * ```typescript
 * // 单列索引
 * { name: 'idx_user_email', table: 'user', columns: 'email', unique: true }
 *
 * // 多列索引
 * { name: 'idx_order_user_date', table: 'order', columns: ['user_id', 'created_at'] }
 * ```
 */
export interface IndexDefinition {
    /** 索引名称 */
    name: string
    /** 表名 */
    table: string
    /** 索引列（可以是单列字符串或多列数组） */
    columns: string | string[]
    /** 是否唯一索引 */
    unique?: boolean
}

/**
 * 触发器定义接口
 *
 * @example
 * ```typescript
 * // 自动更新时间戳的触发器
 * {
 *   name: 'trigger_user_updated_at',
 *   table: 'user',
 *   timing: 'BEFORE',
 *   event: 'UPDATE',
 *   sql: "UPDATE user SET updated_at = CAST(strftime('%s', 'now') AS INTEGER) WHERE rowid = NEW.rowid;"
 * }
 * ```
 */
export interface TriggerDefinition {
    /** 触发器名称 */
    name: string
    /** 表名 */
    table: string
    /** 触发时机：BEFORE（操作前）| AFTER（操作后） */
    timing: 'BEFORE' | 'AFTER'
    /** 触发事件：INSERT（插入）| UPDATE（更新）| DELETE（删除） */
    event: 'INSERT' | 'UPDATE' | 'DELETE'
    /** 触发时执行的 SQL 语句 */
    sql: string
}

/**
 * 表定义接口
 * 包含表的完整定义：列、索引、触发器，以及依赖关系
 *
 * @example
 * ```typescript
 * export const configTableDefinition: TableDefinition = {
 *   name: 'config',
 *   columns: configTableColumns,
 *   indexes: configTableIndexes,
 *   triggers: configTableTriggers,
 *   dependencies: []  // 无依赖
 * }
 * ```
 */
export interface TableDefinition {
    /** 表名 */
    name: string
    /** 列定义数组 */
    columns: ColumnDefinition[]
    /** 索引定义数组 */
    indexes: IndexDefinition[]
    /** 触发器定义数组 */
    triggers: TriggerDefinition[]
}
