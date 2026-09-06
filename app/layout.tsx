import { AntdRegistry } from '@ant-design/nextjs-registry';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { LoadingProvider } from './contexts/loadingProvider';
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
  metadataBase: new URL(companyInfo.url),
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
    images: [
      {
        url: '/Logo.png',
        width: 512,
        height: 512,
        alt: "CMD Breizh - Conciergerie Presqu'île de Crozon",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Conciergerie Presqu'île de Crozon - CMD Breizh",
    description: companyInfo.description,
    images: ['/Logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/Logo.png',
    apple: '/Logo.png',
  },
  alternates: {
    canonical: companyInfo.url,
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
              '@id': `${companyInfo.url}/#business`,
              name: companyInfo.fullName,
              alternateName: companyInfo.shortName,
              description: companyInfo.description,
              url: companyInfo.url,
              logo: `${companyInfo.url}/Logo.png`,
              image: `${companyInfo.url}/Logo.png`,
              address: {
                '@type': 'PostalAddress',
                ...getAddressComponents(companyInfo.address),
              },
              telephone: companyInfo.phone,
              email: companyInfo.email,
              areaServed: companyInfo.areaServed,
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 48.19939569036789,
                longitude: -4.284582138061523,
              },
              openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: businessHours.openingDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)),
                opens: `${String(businessHours.openingHour).padStart(2, '0')}:00`,
                closes: `${String(businessHours.closingHour).padStart(2, '0')}:00`,
              },
              priceRange: companyInfo.priceRange,
              founder: {
                '@type': 'Person',
                name: companyInfo.founder,
              },
              foundingDate: companyInfo.foundingDate,
              sameAs: ['https://www.cmd.bzh'],
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}>
        <AntdRegistry>
          <LoadingProvider>{children}</LoadingProvider>
        </AntdRegistry>
        <Analytics />
      </body>
    </html>
  );
}
