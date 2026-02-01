/**
 * [INPUT]: 依赖 @/app/scenarios/data 的 SCENARIOS
 * [OUTPUT]: 对外提供场景选择页面组件（弧形透视列表）
 * [POS]: app/scenarios 的页面入口, 展示弧形场景选择器
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SCENARIOS } from './data';

// ========== 光点在原图中的位置（像素） ==========
// 原图尺寸: 需要填入实际图片尺寸
const IMG_SIZE = { width: 4000, height: 2667 }; // DP-13139-004.png 原图尺寸
const SPARKLE_PX = { x: 2752, y: 751 }; // 光点像素坐标 (可用图片编辑软件查看)

export default function ScenariosPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const velocity = useRef(0);

  const itemCount = SCENARIOS.length;

  // ========== 光点位置计算 ==========
  const imgRef = useRef<HTMLImageElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [sparklePos, setSparklePos] = useState({ left: '66.67%', top: '33.33%' });

  // 计算 object-fit: cover 下光点的实际位置
  const calcSparklePosition = useCallback(() => {
    const img = imgRef.current;
    const wrapper = wrapperRef.current;
    if (!img || !wrapper || !img.naturalWidth) return;

    const { naturalWidth: imgW, naturalHeight: imgH } = img;
    const { clientWidth: containerW, clientHeight: containerH } = wrapper;

    const imgRatio = imgW / imgH;
    const containerRatio = containerW / containerH;

    let scale: number, offsetX: number, offsetY: number;

    if (containerRatio > imgRatio) {
      // 图片宽度撑满，高度被裁切
      scale = containerW / imgW;
      offsetX = 0;
      offsetY = (containerH - imgH * scale) / 2;
    } else {
      // 图片高度撑满，宽度被裁切
      scale = containerH / imgH;
      offsetX = (containerW - imgW * scale) / 2;
      offsetY = 0;
    }

    // 光点在容器中的绝对位置（用像素坐标计算）
    const x = offsetX + (SPARKLE_PX.x / IMG_SIZE.width) * imgW * scale;
    const y = offsetY + (SPARKLE_PX.y / IMG_SIZE.height) * imgH * scale;

    setSparklePos({ left: `${x}px`, top: `${y}px` });
  }, []);

  // 图片加载完成 + 窗口 resize 时重新计算
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete) calcSparklePosition();

    window.addEventListener('resize', calcSparklePosition);
    return () => window.removeEventListener('resize', calcSparklePosition);
  }, [calcSparklePosition]);

  // 页面加载时自动 focus，以响应键盘
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // 切换选项
  const shiftIndex = (delta: number) => {
    setActiveIndex(prev => {
      const next = prev + delta;
      if (next < 0) return 0;
      if (next >= itemCount) return itemCount - 1;
      return next;
    });
  };

  // 鼠标/触摸事件
  const handleStart = (clientY: number) => {
    isDragging.current = true;
    lastY.current = clientY;
    velocity.current = 0;
  };

  const handleMove = (clientY: number) => {
    if (!isDragging.current) return;
    const delta = lastY.current - clientY;
    velocity.current = delta;
    lastY.current = clientY;
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (Math.abs(velocity.current) > 10) {
      shiftIndex(velocity.current > 0 ? 1 : -1);
    }
  };

  // 滚轮（带冷却时间，阻尼感）
  const wheelCooldown = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (wheelCooldown.current) return;

    if (e.deltaY > 30) {
      shiftIndex(1);
      wheelCooldown.current = true;
      setTimeout(() => { wheelCooldown.current = false; }, 450);
    } else if (e.deltaY < -30) {
      shiftIndex(-1);
      wheelCooldown.current = true;
      setTimeout(() => { wheelCooldown.current = false; }, 450);
    }
  };

  // 键盘
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') shiftIndex(1);
    else if (e.key === 'ArrowUp') shiftIndex(-1);
    else if (e.key === 'Enter') handleEnter();
  };

  // 进入场景
  const handleEnter = () => {
    router.push(`/chat/${SCENARIOS[activeIndex].id}`);
  };

  // 计算每个项目的样式
  const getItemStyle = (index: number) => {
    const offset = index - activeIndex;
    const absOffset = Math.abs(offset);

    // 垂直位置
    const translateY = offset * 70;

    // 透明度：选中项 1，每级降 15%
    const opacity = Math.max(0, 1 - absOffset * 0.15);

    // 模糊：选中项清晰，每级 1px
    const blur = absOffset * 1;

    // 缩放：选中项最大
    const scale = 1 - absOffset * 0.08;

    // X 位移：形成弧形效果，中间最靠右
    const translateX = -absOffset * absOffset * 8;

    return {
      transform: `translateY(${translateY}px) translateX(${translateX}px) scale(${scale})`,
      opacity,
      filter: `blur(${blur}px)`,
      zIndex: 10 - absOffset,
    };
  };

  return (
    <div
      className="arc-selector-page"
      onWheel={handleWheel}
      onMouseDown={(e) => handleStart(e.clientY)}
      onMouseMove={(e) => handleMove(e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={containerRef}
    >
      {/* ========== 背景图片 + 亮点 ========== */}
      <div className="arc-bg-wrapper" ref={wrapperRef}>
        <img
          ref={imgRef}
          src="/DP-13139-004.png"
          alt=""
          className="arc-bg-image"
          onLoad={calcSparklePosition}
        />
        <div className="arc-bg-sparkle" style={sparklePos} />
      </div>

      {/* ========== 左侧弧形列表（调试时注释掉） ==========
      <div className="arc-list-container">
        <div className="arc-list">
          {SCENARIOS.map((scenario, index) => {
            const isActive = index === activeIndex;
            const style = getItemStyle(index);

            return (
              <div
                key={scenario.id}
                className={`arc-list-item ${isActive ? 'active' : ''}`}
                style={style}
                onClick={() => setActiveIndex(index)}
              >
                <h3 className="arc-list-title">{scenario.name}</h3>
              </div>
            );
          })}
        </div>
      </div>
      */}

      {/* ========== 右侧信息面板（调试时注释掉） ==========
      <div className="arc-info-panel">
        <div className="arc-info-header">
          <h2 className="arc-info-section-title">SCENARIO</h2>
        </div>

        <div className="arc-info-current">
          <div className="arc-info-label">IN:</div>
          <h2 className="arc-info-name">{SCENARIOS[activeIndex].name}</h2>

          <div className="arc-info-label out">OUT:</div>
          <p className="arc-info-description">{SCENARIOS[activeIndex].description}</p>
        </div>

        <button className="arc-enter-btn" onClick={handleEnter}>
          Start
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <p className="arc-hint">Scroll or drag to select</p>
      </div>
      */}
    </div>
  );
}
