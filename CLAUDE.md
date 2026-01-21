# AI Asks Human

角色反转对话应用 - AI 通过提问帮助人类思考

Next.js 15 + React 19 + TypeScript + Tailwind CSS + OpenAI SDK (DeepSeek)

## 目录结构

```
ai-asks-human/
├── app/                    # Next.js App Router
│   ├── api/chat/          # API 路由: 聊天接口
│   ├── chat/[scenarioId]/ # 动态路由: 聊天页面
│   ├── scenarios/         # 场景数据定义
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页: 场景选择
├── components/            # React 组件
│   └── ChatInterface.tsx  # 聊天界面组件
├── lib/                   # 工具库
│   ├── openai.ts         # DeepSeek API 客户端
│   └── storage.ts        # LocalStorage 封装
├── types/                 # TypeScript 类型定义
│   └── index.ts          # 核心类型: Message, Conversation, Scenario
└── public/               # 静态资源
```

## 关键决策

- **存储**: MVP 阶段使用 LocalStorage, 后续迁移 Supabase
- **AI API**: 使用 OpenAI SDK 配合 DeepSeek API (兼容接口)
- **样式**: Tailwind CSS + CSS 变量 (支持暗色模式)

## 开发命令

```bash
npm install    # 安装依赖
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
```

## 环境变量

复制 `.env.example` 为 `.env.local` 并填入 DeepSeek API Key

[PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
