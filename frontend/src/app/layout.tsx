/**
 * Root layout
 */
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';
import '@/globals.css';

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'Production-ready expense tracking application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
