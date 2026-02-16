import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '顧客管理ツール | CRM System',
  description: '顧客情報、注文履歴、会員管理、連絡機能を備えた統合型顧客管理システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  );
}
