/**
 * [INPUT]: 依赖 next/font 的字体, 依赖全局 CSS
 * [OUTPUT]: 对外提供 RootLayout 根布局组件
 * [POS]: app 的根布局, 包裹所有页面
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import type { Metadata } from 'next';
import { Outfit, Noto_Sans_SC, EB_Garamond, Cinzel_Decorative } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Asks Human | 思维空间',
  description: '角色反转 — AI 通过提问帮助你深度思考',
  keywords: ['AI', '思考', '提问', '职业发展', '决策', '学习'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${outfit.variable} ${notoSansSC.variable} ${ebGaramond.variable} ${cinzelDecorative.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
