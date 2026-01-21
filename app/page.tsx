/**
 * [INPUT]: 依赖 @/app/scenarios/data 的 SCENARIOS
 * [OUTPUT]: 对外提供首页组件, 展示场景选择
 * [POS]: app 的首页入口
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import Link from 'next/link';
import { SCENARIOS } from './scenarios/data';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* ========== header ========== */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Asks Human</h1>
          <p className="text-lg text-[var(--muted)]">
            角色反转 - AI 通过提问帮助你思考
          </p>
        </header>

        {/* ========== scenario cards ========== */}
        <div className="grid gap-4">
          {SCENARIOS.map((scenario) => (
            <Link
              key={scenario.id}
              href={`/chat/${scenario.id}`}
              className="block p-6 border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
            >
              <h2 className="text-xl font-semibold mb-2">{scenario.name}</h2>
              <p className="text-[var(--muted)]">{scenario.description}</p>
            </Link>
          ))}
        </div>

        {/* ========== footer ========== */}
        <footer className="mt-12 text-center text-sm text-[var(--muted)]">
          <p>选择一个场景, 开始你的思考之旅</p>
        </footer>
      </div>
    </main>
  );
}
