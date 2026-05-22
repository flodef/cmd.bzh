import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { MenuProvider } from './contexts/menuProvider';
import { Analytics } from '@vercel/analytics/react';
import { companyInfo, businessHours, getAddressComponents } from './utils/constants';
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
  title: "Conciergerie Presqu'île de Crozon - CMD Breizh | Nettoyage, Jardinage, Gestion",
  description: companyInfo.description,
  applicationName: 'CMD Breizh',
  authors: [{ name: 'Flojito Stillnet' }],
  generator: 'Next.js',
  keywords: [
    'Conciergerie',
    "Presqu'île de Crozon",
    'Crozon',
    'Saint-Nic',
    'Plomodiern',
    'Morgat',
    'Camaret',
    'Telgruc',
    'Nettoyage',
    'Jardinage',
    'Check in / Check out',
    'Gestion du linge',
    'Panier de bienvenue',
    'Multi-Services',
    'Location saisonnière',
    'Gestion locative',
    'Conciergerie Bretagne',
    'Conciergerie Finistère',
  ],
  creator: 'Flojito Stillnet',
  publisher: 'CMD Breizh',
  openGraph: {
    title: "Conciergerie Presqu'île de Crozon - CMD Breizh",
    description: companyInfo.description,
    url: companyInfo.url,
    siteName: companyInfo.shortName,
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
    <html lang="fr">
      <head>
        <script defer src="https://cloud.umami.is/script.js" data-website-id="8b01b6b5-5654-44d9-896b-6b4a52226756" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: companyInfo.fullName,
              alternateName: companyInfo.shortName,
              description: companyInfo.description,
              address: {
                '@type': 'PostalAddress',
                ...getAddressComponents(companyInfo.address),
              },
              telephone: companyInfo.phone,
              email: companyInfo.email,
              url: companyInfo.url,
              areaServed: companyInfo.areaServed,
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: businessHours.openingDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)),
                opens: `${String(businessHours.openingHour).padStart(2, '0')}:00`,
                closes: `${String(businessHours.closingHour).padStart(2, '0')}:00`,
              },
              priceRange: companyInfo.priceRange,
              founder: companyInfo.founder,
              foundingDate: companyInfo.foundingDate,
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}>
        <AntdRegistry>
          <MenuProvider>{children}</MenuProvider>
        </AntdRegistry>
        <Analytics />
      </body>
    </html>
  );
}
