# P2J - 从拖延到高效的任务管理应用

这是一个基于 Next.js 和 Supabase 构建的任务管理应用，帮助用户将拖延转化为生产力。

## 功能特点

- AI 驱动的任务规划
- 用户认证（注册、登录、登出）
- 任务管理和跟踪
- 游戏化激励系统
- 智能周报

## 技术栈

- Next.js 13 (App Router)
- TypeScript
- Supabase (认证和数据库)
- Tailwind CSS
- Shadcn UI 组件
- Zustand (状态管理)

## 环境设置

1. 克隆仓库

```bash
git clone <repository-url>
cd project
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建 `.env.local` 文件并添加以下内容：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. 启动开发服务器

```bash
npm run dev
```

## Supabase 配置

1. 创建 Supabase 项目
2. 启用邮箱认证
3. 设置重定向 URL（例如：`http://localhost:3000/auth/callback`）
4. 创建必要的数据表（参考 `supabase/migrations` 目录）

## 部署

应用可以部署到 Vercel 或其他支持 Next.js 的平台。

```bash
npm run build
```

## 许可证

[MIT](LICENSE)