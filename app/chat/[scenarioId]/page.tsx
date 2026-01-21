/**
 * [INPUT]: 依赖 @/app/scenarios/data, @/components/ChatInterface
 * [OUTPUT]: 对外提供聊天页面
 * [POS]: app/chat 的动态路由页面, 根据 scenarioId 加载对应场景
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import { notFound } from 'next/navigation';
import { getScenario } from '@/app/scenarios/data';
import ChatInterface from '@/components/ChatInterface';

interface PageProps {
  params: Promise<{ scenarioId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { scenarioId } = await params;
  const scenario = getScenario(scenarioId);

  if (!scenario) {
    notFound();
  }

  return <ChatInterface scenario={scenario} />;
}
