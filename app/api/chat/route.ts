/**
 * [INPUT]: 依赖 @/lib/openai, @/app/scenarios/data, @/types
 * [OUTPUT]: 对外提供 POST /api/chat 接口
 * [POS]: API 路由, 处理聊天请求, 调用 DeepSeek API
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import { NextResponse } from 'next/server';
import { getOpenAIClient, DEFAULT_MODEL } from '@/lib/openai';
import { getScenario } from '@/app/scenarios/data';
import type { ChatRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const { scenarioId, messages } = body;

    const scenario = getScenario(scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: 'Scenario not found' },
        { status: 404 }
      );
    }

    /* ========== build messages for API ========== */
    const apiMessages = [
      { role: 'system' as const, content: scenario.systemPrompt },
      ...messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    /* ========== call DeepSeek API ========== */
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content || '';

    return NextResponse.json({
      message: {
        role: 'assistant',
        content,
      },
      finished: false,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
