/**
 * [INPUT]: 依赖 @/types, @/lib/storage, react hooks
 * [OUTPUT]: 对外提供 ChatInterface 聊天界面组件
 * [POS]: components 的核心交互组件, 处理对话逻辑
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Scenario, Message, Conversation } from '@/types';
import { saveConversation, loadConversation } from '@/lib/storage';

interface Props {
  scenario: Scenario;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

const SCENARIO_ICONS: Record<string, string> = {
  'career-advice': '🧭',
  'decision-making': '⚖️',
  'learning-reflection': '📚',
  'creative-brainstorm': '✨',
};

export default function ChatInterface({ scenario }: Props) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  /* ========== send message ========== */
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
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversation.id,
          scenarioId: scenario.id,
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: data.message.content,
        timestamp: Date.now(),
      };

      const finalConversation: Conversation = {
        ...updatedConversation,
        messages: [...updatedMessages, assistantMessage],
        updatedAt: Date.now(),
      };

      setConversation(finalConversation);
      saveConversation(finalConversation);
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
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
            <span className="text-sm">返回</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xl">{SCENARIO_ICONS[scenario.id] || '💭'}</span>
            <h1 className="font-semibold text-[var(--text-primary)]">{scenario.name}</h1>
          </div>

          <div className="w-16" /> {/* spacer for centering */}
        </header>

        {/* ========== messages ========== */}
        <main className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="max-w-2xl mx-auto space-y-6">
            {conversation.messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`msg-bubble ${message.role === 'user' ? 'user' : 'ai'}`}>
                  {/* AI indicator dot */}
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-[var(--accent)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                      AI 提问
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {/* loading state */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="msg-bubble ai">
                  <div className="flex items-center gap-2 mb-2 text-xs text-[var(--accent)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                    AI 思考中
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

        {/* ========== input area ========== */}
        <footer className="fixed bottom-0 left-0 right-0 p-4 glass">
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的回答..."
              disabled={isLoading}
              className="input-field flex-1"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn-primary"
            >
              <span className="flex items-center gap-2">
                发送
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

          {/* subtle hint */}
          <p className="text-center text-xs text-[var(--text-muted)] mt-3">
            按 Enter 发送 · AI 会根据你的回答继续提问
          </p>
        </footer>
      </div>
    </>
  );
}
