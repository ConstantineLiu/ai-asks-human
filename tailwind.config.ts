/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 Tailwind CSS 配置
 * [POS]: 根目录配置文件
 * [PROTOCOL]: 变更时更新此头部, 然后检查 CLAUDE.md
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
