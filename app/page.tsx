/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 Landing Page 组件
 * [POS]: app 的首页入口, 展示苏格拉底油画背景和标题
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export default function LandingPage() {
  const router = useRouter();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [started, setStarted] = useState(false);

  // 图片加载完成后开始粒子效果 (3.3秒后)
  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 3300);
    return () => clearTimeout(timer);
  }, []);

  // 持续生成随机粒子
  useEffect(() => {
    if (!started) return;

    const createParticle = () => {
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        size: 4 + Math.random() * 3, // 4-7px
        duration: 5 + Math.random() * 3, // 5-8s
        delay: 0,
      };
      setParticles(prev => [...prev, newParticle]);

      // 动画结束后移除粒子
      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, newParticle.duration * 1000);
    };

    // 初始生成一批粒子
    for (let i = 0; i < 10; i++) {
      setTimeout(createParticle, i * 250);
    }

    // 持续随机生成新粒子 (增加30%频率)
    const interval = setInterval(() => {
      if (Math.random() > 0.2) createParticle();
    }, 400);

    return () => clearInterval(interval);
  }, [started]);

  const handleEnter = () => {
    router.push('/scenarios');
  };

  return (
    <div className="landing-page" onClick={handleEnter}>
      {/* ========== background painting ========== */}
      <div className="landing-bg">
        <img
          src="/frontpage.png"
          alt="Socrates teaching Alcibiades"
          className="landing-painting"
        />
      </div>

      {/* ========== gold streaks effect - 随机上升粒子 ========== */}
      <div className="gold-streaks">
        {particles.map(p => (
          <div
            key={p.id}
            className="gold-particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* ========== title overlay ========== */}
      <div className="landing-content">
        <h1 className="landing-title">
          <span className="landing-title-line">Socratic</span>
          <span className="landing-title-line">Maieutics</span>
        </h1>

        <p className="landing-hint">Click anywhere to enter</p>
      </div>
    </div>
  );
}
