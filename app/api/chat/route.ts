/**
 * [INPUT]: 依赖 @/lib/openai, @/lib/tools, @/app/scenarios/data, @/types
 * [OUTPUT]: 对外提供 POST /api/chat 接口, 支持 tool_calls
 * [POS]: API 路由, 处理聊天请求, 调用 NVIDIA NIM API (Kimi K2), 返回 tool_calls
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import { NextResponse } from 'next/server';
import { getOpenAIClient, DEFAULT_MODEL } from '@/lib/openai';
import { askUserQuestionTool } from '@/lib/tools';
import { getScenario } from '@/app/scenarios/data';
import type { ChatRequest, ToolCall } from '@/types';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

/* ================================================================
   Message Format Conversion
   ================================================================ */
interface ApiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
}

function formatMessageForAPI(msg: ApiMessage): ChatCompletionMessageParam {
  if (msg.role === 'assistant' && msg.tool_calls) {
    return {
      role: 'assistant',
      content: msg.content,
      tool_calls: msg.tool_calls.map(tc => ({
        id: tc.id,
        type: 'function' as const,
        function: {
          name: tc.function.name,
          arguments: tc.function.arguments,
        },
      })),
    };
  }

  if (msg.role === 'tool') {
    return {
      role: 'tool',
      tool_call_id: msg.tool_call_id || '',
      content: msg.content || '',
    };
  }

  return {
    role: msg.role as 'system' | 'user' | 'assistant',
    content: msg.content || '',
  };
}

/* ================================================================
   POST Handler
   ================================================================ */
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
    const apiMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: scenario.systemPrompt },
      ...messages.map(m => formatMessageForAPI(m as unknown as ApiMessage)),
    ];

    /* ========== call NVIDIA NIM API with tools ========== */
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: apiMessages,
      tools: [askUserQuestionTool],
      temperature: 0.7,
      max_tokens: 1000,
      // @ts-ignore - NVIDIA NIM extra_body: disable thinking mode
      extra_body: { chat_template_kwargs: { thinking: false } },
    });

    const choice = response.choices[0];
    const message = choice?.message;

    /* ========== extract tool_calls if present ========== */
    const toolCalls: ToolCall[] | undefined = message?.tool_calls?.map(tc => ({
      id: tc.id,
      type: 'function' as const,
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    }));

    return NextResponse.json({
      message: {
        role: 'assistant',
        content: message?.content || '',
        tool_calls: toolCalls,
      },
      finished: choice?.finish_reason === 'stop',
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
