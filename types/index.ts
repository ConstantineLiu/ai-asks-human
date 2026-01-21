/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 Message, Conversation, Scenario, ChatRequest 等核心类型
 * [POS]: types 的类型定义入口, 被全局消费
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  scenarioId: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  initialQuestion: string;
}

export interface ChatRequest {
  conversationId: string;
  scenarioId: string;
  messages: Pick<Message, 'role' | 'content'>[];
}

export interface ChatResponse {
  message: Message;
  finished: boolean;
}
