/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 Message, Conversation, Scenario, ChatRequest, ToolCall, Question 等核心类型
 * [POS]: types 的类型定义入口, 被全局消费
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

/* ================================================================
   Tool Call Types - AskUserQuestion
   ================================================================ */
export interface QuestionOption {
  label: string;
  description: string;
}

export interface Question {
  question: string;
  header: string;
  options: QuestionOption[];
  multiSelect: boolean;
}

export interface ToolCallFunction {
  name: string;
  arguments: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: ToolCallFunction;
}

/* ================================================================
   Message Types
   ================================================================ */
export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: number;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
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
  message: {
    role: 'assistant';
    content: string;
    tool_calls?: ToolCall[];
  };
  finished: boolean;
}

/* ================================================================
   Answers Type - User responses to questions
   ================================================================ */
export type AnswerValue = string | string[];
export type Answers = Record<string, AnswerValue | undefined>;
