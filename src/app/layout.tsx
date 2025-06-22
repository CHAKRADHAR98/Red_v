import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import NavigationWrapper from '../components/ui/NavigationWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solana Blockchain Explorer',
  description: 'Interactive tool for exploring Solana blockchain data, wallets, transactions, and tokens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
              <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold text-gray-900">
                Red-v
                </h1>
              </div>
            </header>
            <div className="mx-auto max-w-7xl">
              <NavigationWrapper />
            </div>
            <main>
              <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
            <footer className="border-t border-gray-200 mt-12 py-6 bg-white">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <p className="text-center text-sm text-gray-500">
                  &copy; {new Date().getFullYear()} Solana Blockchain Explorer. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}