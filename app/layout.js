import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/useFirebaseAuth';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata = {
  title: 'Dhandho AI — Automate Your Business with AI',
  description:
    'Chat with Dhandho AI to discover your bottlenecks, get custom automation workflows, and calculate your exact ROI.',
  icons: {
    icon: '/logo.jfif',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-base text-white font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
