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

export default function ChatInterface({ scenario }: Props) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // TODO: show error toast
    } finally {
      setIsLoading(false);
    }
  }

  if (!conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ========== header ========== */}
      <header className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-[var(--muted)] hover:text-[var(--foreground)]">
          &larr; 返回
        </Link>
        <h1 className="font-semibold">{scenario.name}</h1>
        <div className="w-12" /> {/* spacer */}
      </header>

      {/* ========== messages ========== */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--accent-light)] text-[var(--foreground)]'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-[var(--accent-light)]">
                <span className="inline-block animate-pulse">AI 正在思考...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ========== input ========== */}
      <footer className="border-t border-[var(--border)] p-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的回答..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-[var(--border)] rounded-xl bg-transparent focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </form>
      </footer>
    </div>
  );
}
