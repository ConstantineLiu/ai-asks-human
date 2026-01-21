/**
 * [INPUT]: 依赖 next/font 的字体, 依赖全局 CSS
 * [OUTPUT]: 对外提供 RootLayout 根布局组件
 * [POS]: app 的根布局, 包裹所有页面
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'AI Asks Human',
  description: 'AI 通过提问帮助你思考',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
