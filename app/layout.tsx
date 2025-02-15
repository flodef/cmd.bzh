import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { MenuProvider } from './contexts/menuProvider';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});
const caveat = localFont({
  src: './fonts/CaveatVF.ttf',
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CMD Breizh',
  description: "Conciergerie MultiService Debieu presqu'ile de Crozon",
  applicationName: 'CMD Breizh',
  authors: [{ name: 'Flojito Stillnet' }],
  generator: 'Next.js',
  keywords: [
    'Conciergerie',
    'Presqu’ile de Crozon',
    'Saint-Nic',
    'Nettoyage',
    'Jardinage',
    'Check in / Check out',
    'Gestion du linge',
    'Panier de bienvenue',
    'Multi-Services',
  ],
  creator: 'Flojito Stillnet',
  publisher: 'CMD Breizh',
  openGraph: {
    title: 'CMD Breizh',
    description: "Conciergerie MultiService Debieu presqu'ile de Crozon",
    url: 'https://cmd.bzh',
    siteName: 'CMD Breizh',
    locale: 'fr_FR',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: 'https://www.cmd.bzh/Logo.png',
  },
  alternates: {
    canonical: 'https://www.cmd.bzh',
  },
  category: 'Conciergerie',
  classification: 'Location de biens immobiliers',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}>
        <AntdRegistry>
          <MenuProvider>{children}</MenuProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
