/**
 * [INPUT]: 依赖 @/types, @/lib/storage, react hooks, QuestionPanel
 * [OUTPUT]: 对外提供 ChatInterface 聊天界面组件
 * [POS]: components 的核心交互组件, 处理对话逻辑, 集成 tool_calls
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Scenario, Message, Conversation, ToolCall, Question, Answers } from '@/types';
import { saveConversation, loadConversation } from '@/lib/storage';
import QuestionPanel from './QuestionPanel';

interface Props {
  scenario: Scenario;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const SCENARIO_ICONS: Record<string, string> = {
  'career-advice': '???',
  'decision-making': '???',
  'learning-reflection': '???',
  'creative-brainstorm': '???',
};

export default function ChatInterface({ scenario }: Props) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingToolCall, setPendingToolCall] = useState<ToolCall | null>(null);
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ========== init conversation ========== */
  useEffect(() => {
    const conversationId = `${scenario.id}-${Date.now()}`;
    const existing = loadConversation(conversationId);

    if (existing) {
      setConversation(existing);
    } else {
      const initialMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: scenario.initialQuestion,
        timestamp: Date.now(),
      };

      const newConversation: Conversation = {
        id: conversationId,
        scenarioId: scenario.id,
        messages: [initialMessage],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setConversation(newConversation);
      saveConversation(newConversation);
    }
  }, [scenario]);

  /* ========== auto scroll ========== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  /* ========== focus input after loading ========== */
  useEffect(() => {
    if (!isLoading && !pendingToolCall) {
      inputRef.current?.focus();
    }
  }, [isLoading, pendingToolCall]);

  /* ========== call API ========== */
  async function callAPI(messages: Message[]) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation?.id,
          scenarioId: scenario.id,
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            tool_calls: m.tool_calls,
            tool_call_id: m.tool_call_id,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      return data;
    } finally {
      setIsLoading(false);
    }
  }

  /* ========== handle API response ========== */
  function handleAPIResponse(
    data: { message: { role: string; content: string; tool_calls?: ToolCall[] }; finished: boolean },
    currentMessages: Message[]
  ) {
    const { message, finished } = data;

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: message.content,
      timestamp: Date.now(),
      tool_calls: message.tool_calls,
    };

    const updatedMessages = [...currentMessages, assistantMessage];
    const updatedConversation: Conversation = {
      ...conversation!,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    setConversation(updatedConversation);
    saveConversation(updatedConversation);

    /* ========== check for tool_calls ========== */
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls.find(tc => tc.function.name === 'AskUserQuestion');
      if (toolCall) {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          setPendingToolCall(toolCall);
          setPendingQuestions(args.questions);
        } catch (e) {
          console.error('Failed to parse tool arguments', e);
        }
      }
    }
  }

  /* ========== send user message ========== */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading || !conversation) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...conversation.messages, userMessage];
    const updatedConversation: Conversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    setConversation(updatedConversation);
    saveConversation(updatedConversation);
    setInput('');

    try {
      const data = await callAPI(updatedMessages);
      handleAPIResponse(data, updatedMessages);
    } catch (error) {
      console.error('Chat error:', error);
    }
  }

  /* ========== handle question panel submit ========== */
  async function handleQuestionSubmit(answers: Answers) {
    if (!pendingToolCall || !conversation) return;

    const toolResultMessage: Message = {
      id: generateId(),
      role: 'tool',
      content: JSON.stringify(answers),
      timestamp: Date.now(),
      tool_call_id: pendingToolCall.id,
    };

    const updatedMessages = [...conversation.messages, toolResultMessage];
    const updatedConversation: Conversation = {
      ...conversation,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    setConversation(updatedConversation);
    saveConversation(updatedConversation);

    setPendingToolCall(null);
    setPendingQuestions([]);

    try {
      const data = await callAPI(updatedMessages);
      handleAPIResponse(data, updatedMessages);
    } catch (error) {
      console.error('Chat error:', error);
    }
  }

  /* ========== format tool result for display ========== */
  function formatToolResult(content: string): string {
    try {
      const parsed = JSON.parse(content);
      return Object.entries(parsed)
        .map(([key, value]) => {
          const displayValue = Array.isArray(value) ? value.join(', ') : value;
          return `${displayValue}`;
        })
        .join(' | ');
    } catch {
      return content;
    }
  }

  if (!conversation) {
    return (
      <>
        <div className="bg-cosmos" />
        <div className="grid-overlay" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="typing-indicator">
            <span />
            <span />
            <span />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* ========== animated background ========== */}
      <div className="bg-cosmos" />
      <div className="grid-overlay" />

      <div className="min-h-screen flex flex-col relative">
        {/* ========== header ========== */}
        <header className="glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between fade-in-up">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12 4L6 10L12 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm">Back</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xl">{SCENARIO_ICONS[scenario.id] || '???'}</span>
            <h1 className="font-semibold text-[var(--text-primary)]">{scenario.name}</h1>
          </div>

          <div className="w-16" />
        </header>

        {/* ========== messages ========== */}
        <main className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="max-w-2xl mx-auto space-y-6">
            {conversation.messages.map((message, index) => {
              if (message.role === 'tool') {
                return (
                  <div
                    key={message.id}
                    className="flex justify-end"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="msg-bubble user tool-result">
                      <div className="flex items-center gap-2 mb-2 text-xs text-[var(--accent-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-secondary)]" />
                        Your Answer
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {formatToolResult(message.content)}
                      </p>
                    </div>
                  </div>
                );
              }

              if (message.role === 'assistant' && message.tool_calls && message.tool_calls.length > 0) {
                return (
                  <div
                    key={message.id}
                    className="flex justify-start"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="msg-bubble ai">
                      <div className="flex items-center gap-2 mb-2 text-xs text-[var(--accent)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        AI Asking Questions
                      </div>
                      {message.content && (
                        <p className="whitespace-pre-wrap leading-relaxed mb-2">{message.content}</p>
                      )}
                      <p className="text-sm text-[var(--text-muted)]">
                        Please select your answers below...
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`msg-bubble ${message.role === 'user' ? 'user' : 'ai'}`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-[var(--accent)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                        AI
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              );
            })}

            {/* loading state */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="msg-bubble ai">
                  <div className="flex items-center gap-2 mb-2 text-xs text-[var(--accent)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    AI Thinking
                  </div>
                  <div className="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* ========== question panel ========== */}
        {pendingToolCall && pendingQuestions.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40">
            <QuestionPanel
              questions={pendingQuestions}
              onSubmit={handleQuestionSubmit}
            />
          </div>
        )}

        {/* ========== input area ========== */}
        {!pendingToolCall && (
          <footer className="fixed bottom-0 left-0 right-0 p-4 glass">
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your response..."
                disabled={isLoading}
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="btn-primary"
              >
                <span className="flex items-center gap-2">
                  Send
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M14 2L7 9M14 2L9.5 14L7 9M14 2L2 6.5L7 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </form>

            <p className="text-center text-xs text-[var(--text-muted)] mt-3">
              Press Enter to send
            </p>
          </footer>
        )}
      </div>
    </>
  );
}
