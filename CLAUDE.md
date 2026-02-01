# AI Asks Human

角色反转对话应用 - AI 通过提问帮助人类思考

Next.js 15 + React 19 + TypeScript + Tailwind CSS + OpenAI SDK (NVIDIA NIM + Kimi K2)

## 目录结构

```
ai-asks-human/
├── app/                    # Next.js App Router
│   ├── api/chat/          # API 路由: 聊天接口, 支持 tool_calls
│   ├── chat/[scenarioId]/ # 动态路由: 聊天页面
│   ├── scenarios/         # 场景数据定义, 包含强制使用 Tool 的提示词
│   ├── globals.css        # 全局样式 + QuestionPanel 样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页: 场景选择
├── components/            # React 组件
│   ├── ChatInterface.tsx  # 聊天界面组件, 集成 tool_calls 处理
│   └── QuestionPanel.tsx  # AskUserQuestion 问题选择面板
├── lib/                   # 工具库
│   ├── openai.ts         # NVIDIA NIM API 客户端 (Kimi K2)
│   ├── storage.ts        # LocalStorage 封装
│   └── tools.ts          # OpenAI Function Calling 工具定义
├── types/                 # TypeScript 类型定义
│   └── index.ts          # 核心类型: Message, ToolCall, Question, Answers 等
└── public/               # 静态资源
```

## 核心功能: AskUserQuestion Function Calling

AI 通过 `AskUserQuestion` 工具向用户提问, 而非直接发送文本问题:

1. **工具定义** (`lib/tools.ts`): OpenAI Function Calling 格式的工具定义
2. **API 路由** (`app/api/chat/route.ts`): 传入 tools, 返回 tool_calls
3. **QuestionPanel** (`components/QuestionPanel.tsx`): 渲染选项界面, 支持:
   - Tab 切换多个问题
   - 单选/多选选项
   - "Other" 自定义输入
   - 键盘导航 (Up/Down/Left/Right/Space/Enter)
4. **ChatInterface** (`components/ChatInterface.tsx`): 检测 tool_calls, 显示 QuestionPanel, 提交答案

## 数据流

```
用户消息 → API (with tools) → AI 返回 tool_calls
    → QuestionPanel 显示
    → 用户选择答案 → 构造 tool 消息
    → API → AI 继续对话或再次提问
```

## 关键决策

- **存储**: MVP 阶段使用 LocalStorage, 后续迁移 Supabase
- **AI API**: 使用 OpenAI SDK 配合 NVIDIA NIM API (Kimi K2, 不思考模式)
- **样式**: Tailwind CSS + CSS 变量 (支持暗色模式)
- **交互**: AskUserQuestion Tool 强制 AI 使用结构化提问

## 开发命令

```bash
npm install    # 安装依赖
npm run dev    # 启动开发服务器
npm run build  # 构建生产版本
```

## 环境变量

创建 `.env.local` 并填入 `NVIDIA_API_KEY` (NVIDIA NIM API Key)

[PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
