/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 saveConversation, loadConversation, clearConversation
 * [POS]: lib 的本地存储封装, 被组件层消费, MVP 阶段使用 LocalStorage
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import type { Conversation } from '@/types';

const STORAGE_KEY = 'ai-asks-human-conversations';

export function saveConversation(conversation: Conversation): void {
  if (typeof window === 'undefined') return;

  const existing = loadAllConversations();
  const index = existing.findIndex(c => c.id === conversation.id);

  if (index >= 0) {
    existing[index] = conversation;
  } else {
    existing.push(conversation);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function loadConversation(id: string): Conversation | null {
  if (typeof window === 'undefined') return null;

  const all = loadAllConversations();
  return all.find(c => c.id === id) || null;
}

export function loadAllConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearConversation(id: string): void {
  if (typeof window === 'undefined') return;

  const existing = loadAllConversations();
  const filtered = existing.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
