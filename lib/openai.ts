/**
 * [INPUT]: 依赖 openai SDK, 依赖环境变量 OPENAI_API_KEY/OPENAI_BASE_URL
 * [OUTPUT]: 对外提供 getOpenAIClient 获取客户端实例
 * [POS]: lib 的 API 客户端配置, 被 API routes 消费
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com/v1',
    });
  }
  return openaiClient;
}

export const DEFAULT_MODEL = 'deepseek-chat';
