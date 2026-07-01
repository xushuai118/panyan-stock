import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: '盘研智选 - AI 驱动的智能选股平台',
  description: '用自然语言提问，让 AI 帮你从 A 股中筛出符合策略的标的',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans bg-bg-page text-content-1">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
