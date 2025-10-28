# P2J - 从拖延到高效

## API 配置说明

本项目使用 AI API 来生成任务计划和周报摘要。你需要配置以下环境变量：

### 设置环境变量

1. 在项目根目录创建 `.env.local` 文件（本地开发用）
2. 添加以下内容：

```
OPENROUTER_API_KEY=你的OpenRouter_API密钥
OPENROUTER_API_URL=https://openrouter.ai/api/v1/chat/completions
DEFAULT_MODEL=deepseek/deepseek-chat-v3.1
```

3. 如果部署到 Vercel，请在 Vercel 项目设置中添加同样的环境变量

### 支持的 API 提供商

目前项目默认使用 OpenRouter API，支持 deepseek-chat-v3.1 模型。

如果你想使用其他 API 提供商，可以修改环境变量中的 API URL 和模型名称，或者修改 `app/api/generate-schedule/route.ts` 和 `app/api/generate-summary/route.ts` 文件中的 API 调用代码。

## 开发说明

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

## 技术架构

- 前端框架：Next.js 13 App Router
- UI 组件：Shadcn UI + Tailwind CSS
- 状态管理：Zustand
- AI 集成：服务器端 API 路由

## 性能优化

- API 调用已移至服务器端，避免客户端暴露 API 密钥
- 使用 Next.js API 路由处理 AI 请求，提高安全性
- 环境变量配置遵循 Next.js 最佳实践

## 常见问题

### 服务器启动问题

如果遇到 `EPERM: operation not permitted` 错误，可能是端口被占用，尝试以下解决方法：

1. 关闭可能占用端口的其他应用
2. 使用不同端口启动：
```bash
npx next dev -p 3001
```

3. 或者找出并关闭占用端口的进程：
```bash
# 查找占用 3000 端口的进程
lsof -i :3000
# 终止进程
kill -9 进程ID
```