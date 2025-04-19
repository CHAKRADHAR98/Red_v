import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import NavigationWrapper from '../components/ui/NavigationWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Solana Blockchain Visualization',
  description: 'Interactive tool for visualizing Solana blockchain data and wallet interactions',
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
              <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Solana Blockchain Visualization
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
          </div>
        </Providers>
      </body>
    </html>
  );
}