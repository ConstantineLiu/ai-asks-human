/**
 * [INPUT]: 依赖 @/app/scenarios/data 的 SCENARIOS
 * [OUTPUT]: 对外提供场景选择页面组件
 * [POS]: app/scenarios 的页面入口, 展示场景选择卡片
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import Link from 'next/link';
import { SCENARIOS } from './data';

const SCENARIO_ICONS: Record<string, string> = {
  'career-advice': '🧭',
  'decision-making': '⚖️',
  'learning-reflection': '📚',
  'creative-brainstorm': '✨',
};

export default function ScenariosPage() {
  return (
    <>
      {/* ========== animated background ========== */}
      <div className="bg-cosmos" />
      <div className="grid-overlay" />

      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        <div className="max-w-xl w-full">
          {/* ========== header ========== */}
          <header className="text-center mb-14 fade-in-up">
            {/* decorative element */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] pulse-glow" />
              <span className="text-sm text-[var(--text-secondary)]">思维空间已就绪</span>
            </div>

            <h1 className="text-5xl font-bold mb-4 tracking-tight text-shine">
              AI Asks Human
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-md mx-auto">
              角色反转 — 让 AI 通过提问引导你深度思考
            </p>
          </header>

          {/* ========== scenario cards ========== */}
          <div className="grid gap-4">
            {SCENARIOS.map((scenario, index) => (
              <Link
                key={scenario.id}
                href={`/chat/${scenario.id}`}
                className="card p-6 block stagger-item"
                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <div className="flex items-start gap-4 relative z-10">
                  {/* icon */}
                  <div className="scenario-icon flex-shrink-0">
                    {SCENARIO_ICONS[scenario.id] || '💭'}
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold mb-1.5 text-[var(--text-primary)]">
                      {scenario.name}
                    </h2>
                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                      {scenario.description}
                    </p>
                  </div>

                  {/* arrow indicator */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] transition-all duration-300 group-hover:text-[var(--accent)]">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="transition-transform duration-300"
                    >
                      <path
                        d="M6 3L11 8L6 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* ========== footer ========== */}
          <footer className="mt-12 text-center stagger-item" style={{ animationDelay: '0.6s' }}>
            <p className="text-sm text-[var(--text-muted)]">
              选择一个场景，开启你的思维之旅
            </p>
          </footer>
        </div>
      </main>
    </>
  );
}
