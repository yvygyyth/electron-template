# 数据库模块使用指南

这是一个基于 Kysely 和 better-sqlite3 的数据库模块，提供了类型安全的数据库操作。

## 目录结构

```
db/
├── index.ts                    # 数据库连接和初始化
├── schema/
│   └── config.ts              # Config 表的类型定义
├── repositories/
│   └── config.repository.ts   # Config 表的操作封装
├── example.ts                 # 使用示例
└── README.md                  # 本文件
```

## 快速开始

### 1. 初始化数据库

数据库会在第一次调用 `getDatabase()` 时自动初始化。你可以在主进程启动时调用：

```typescript
import { getDatabase } from './db'

// 在应用启动时初始化数据库
app.whenReady().then(() => {
  getDatabase() // 这会自动创建数据库和表
  createWindow()
})
```

### 2. 使用 Repository 进行 CRUD 操作

```typescript
import { configRepository } from './db/repositories/config.repository'

// 创建配置
const config = await configRepository.create({
  key: 'app.theme',
  value: { mode: 'dark', primaryColor: '#1890ff' },
  description: '应用主题配置'
})

// 获取配置
const themeConfig = await configRepository.getByKey('app.theme')

// 更新配置
await configRepository.update('app.theme', {
  value: { mode: 'light', primaryColor: '#52c41a' }
})

// 删除配置
await configRepository.delete('app.theme')

// 创建或更新（upsert）
await configRepository.upsert({
  key: 'app.language',
  value: { lang: 'zh-CN' },
  description: '应用语言'
})
```

### 3. 使用原生 Kysely 查询（高级用法）

如果你需要更复杂的查询，可以直接使用 Kysely：

```typescript
import { getDatabase } from './db'

const db = getDatabase()

// 复杂查询示例
const configs = await db
  .selectFrom('config')
  .select(['key', 'description', 'created_at'])
  .where('key', 'like', 'app.%')
  .orderBy('created_at', 'desc')
  .limit(10)
  .execute()
```

## 添加新表

### 1. 定义表结构

在 `schema/` 目录下创建新的类型定义文件，例如 `user.ts`：

```typescript
import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface UserTable {
  id: Generated<number>
  name: string
  email: string
  created_at: number
  updated_at: number
}

export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UserUpdate = Updateable<UserTable>
```

### 2. 在数据库接口中注册

在 `index.ts` 中添加新表：

```typescript
import { UserTable } from './schema/user'

export interface Database {
  config: ConfigTable
  user: UserTable  // 添加新表
}
```

### 3. 创建表迁移

在 `initializeDatabase` 函数中添加创建表的逻辑：

```typescript
// 检查并创建 user 表
const userTableExists = await database
  .selectFrom('sqlite_master')
  .select('name')
  .where('type', '=', 'table')
  .where('name', '=', 'user')
  .executeTakeFirst()

if (!userTableExists) {
  await database.schema
    .createTable('user')
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('created_at', 'integer', (col) => col.notNull())
    .addColumn('updated_at', 'integer', (col) => col.notNull())
    .execute()
}
```

### 4. 创建 Repository（可选）

在 `repositories/` 目录下创建对应的 repository 文件，封装常用的 CRUD 操作。

## 注意事项

1. **JSON 字段处理**：SQLite 中 JSON 存储为 TEXT，Repository 会自动处理 JSON 字符串和对象之间的转换。

2. **数据库路径**：
   - 开发环境：项目根目录下的 `app.db`
   - 生产环境：用户数据目录下的 `app.db`

3. **关闭连接**：在应用退出时记得关闭数据库连接：

```typescript
import { closeDatabase } from './db'

app.on('before-quit', async () => {
  await closeDatabase()
})
```

## 更多示例

查看 `example.ts` 文件了解更多使用示例。





