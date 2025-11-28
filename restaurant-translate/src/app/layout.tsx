import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RestaurantTranslate - 多言語レストランメニュー',
  description: 'QRコード対応の多言語レストランメニュー翻訳システム',
  keywords: ['restaurant', 'menu', 'translation', 'multilingual', 'QR code', 'inbound tourism'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
