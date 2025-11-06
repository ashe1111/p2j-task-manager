# Supabase 配置指南

## 环境设置

1. 确保 `.env.local` 文件包含正确的 Supabase 配置：

```
NEXT_PUBLIC_SUPABASE_URL=https://pjcqfzdixssljjkcoazr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY3FmemRpeHNzbGpqa2NvYXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMjkyNjcsImV4cCI6MjA3NzkwNTI2N30.Cbm8LgB3gtA1-JT9CCmVlmU9Rp8r86FPN4fbNYHtp0o
```

## Supabase 设置

### 1. 认证设置

1. 登录 Supabase 仪表板
2. 进入 **Authentication** > **Providers**
3. 启用 **Email** 提供商
4. 在 **Site URL** 设置为您的网站 URL（本地开发时设为 `http://localhost:3000`）
5. 在 **Redirect URLs** 添加 `http://localhost:3000/auth/callback`

### 2. 数据库迁移

在 Supabase 控制台中运行以下 SQL 脚本：

1. 首先运行 `migrations/20251021161918_create_p2j_schema.sql`
2. 然后运行 `migrations/20251106_create_auth_trigger.sql`

或者，您可以复制这些文件的内容并在 Supabase SQL 编辑器中运行。

### 3. 常见问题解决

#### 注册问题

如果注册时遇到 "row-level security policy" 错误：

1. 确保已运行所有迁移脚本
2. 检查 Supabase 控制台中的 RLS 策略是否正确设置
3. 确保重定向 URL 设置为 `http://localhost:3000/auth/callback`

#### 数据库错误

如果遇到 "Database error saving new user" 或 "profiles.id 不是 uuid" 错误：

1. 确保已运行 `20251106_create_auth_trigger.sql` 脚本
2. 检查 Supabase 控制台中的触发器是否正确创建

#### 本地运行问题

如果应用程序无法在本地运行：

1. 尝试使用不同的端口，如 `npm run dev -- -p 3001`
2. 确保在 Supabase 控制台中更新重定向 URL
