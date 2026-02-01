/**
 * [INPUT]: 依赖 openai SDK, 依赖环境变量 NVIDIA_API_KEY
 * [OUTPUT]: 对外提供 getOpenAIClient 获取客户端实例
 * [POS]: lib 的 API 客户端配置 (NVIDIA NIM + Kimi K2), 被 API routes 消费
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
    });
  }
  return openaiClient;
}

export const DEFAULT_MODEL = 'moonshotai/kimi-k2-thinking';
