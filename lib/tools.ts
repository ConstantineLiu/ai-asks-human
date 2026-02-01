/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 askUserQuestionTool 工具定义
 * [POS]: lib 的工具定义模块, 供 API 路由消费
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import type { ChatCompletionTool } from 'openai/resources/chat/completions';

/* ================================================================
   AskUserQuestion Tool - OpenAI Function Calling Format
   ================================================================ */
export const askUserQuestionTool: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'AskUserQuestion',
    description: `Use this tool when you need to ask the user questions during execution. This allows you to:
1. Gather user preferences or requirements
2. Clarify ambiguous instructions
3. Get decisions on implementation choices as you work
4. Offer choices to the user about what direction to take.

Usage notes:
- Users will always be able to select "Other" to provide custom text input
- Use multiSelect: true to allow multiple answers to be selected for a question`,
    parameters: {
      type: 'object',
      properties: {
        questions: {
          type: 'array',
          description: 'Questions to ask the user (1-4 questions)',
          items: {
            type: 'object',
            properties: {
              question: {
                type: 'string',
                description: 'The complete question to ask the user. Should be clear, specific, and end with a question mark.',
              },
              header: {
                type: 'string',
                description: 'Very short label displayed as a chip/tag (max 12 chars). Examples: "Auth method", "Library", "Approach".',
              },
              options: {
                type: 'array',
                description: 'The available choices for this question. Must have 2-4 options.',
                items: {
                  type: 'object',
                  properties: {
                    label: {
                      type: 'string',
                      description: 'The display text for this option (1-5 words).',
                    },
                    description: {
                      type: 'string',
                      description: 'Explanation of what this option means or what will happen if chosen.',
                    },
                  },
                  required: ['label', 'description'],
                },
                minItems: 2,
                maxItems: 4,
              },
              multiSelect: {
                type: 'boolean',
                default: false,
                description: 'Set to true to allow the user to select multiple options.',
              },
            },
            required: ['question', 'header', 'options', 'multiSelect'],
          },
          minItems: 1,
          maxItems: 4,
        },
      },
      required: ['questions'],
    },
  },
};
