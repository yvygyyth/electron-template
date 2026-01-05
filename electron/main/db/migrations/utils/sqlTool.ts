import type { ColumnDefinition } from '../../type'

/**
 * 判断默认值是否是 SQL 语句
 * 规则：被英文括号包裹的字符串就当作 SQL 语句执行
 *
 * @param defaultValue 默认值（可以是字面值或字符串）
 * @returns 如果是 SQL 语句返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isSqlExpression【"CAST(strftime('%s', 'now') AS INTEGER)"】 // false（未被括号包裹）
 * isSqlExpression【"(CAST(strftime('%s', 'now') AS INTEGER))"】 // true（被括号包裹）
 * isSqlExpression【"some text"】 // false
 * isSqlExpression【123】 // false
 * ```
 */
export function isSqlExpression(defaultValue: ColumnDefinition['defaultValue']): defaultValue is string {
    if (typeof defaultValue !== 'string') {
        return false
    }
    // 检查是否被英文括号包裹：以 ( 开头并以 ) 结尾
    const trimmed = defaultValue.trim()
    return trimmed.startsWith('(') && trimmed.endsWith(')')
}
