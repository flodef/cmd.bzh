import { MetadataRoute } from 'next';
import { companyInfo } from './utils/constants';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: companyInfo.fullName,
    short_name: companyInfo.shortName,
    description: companyInfo.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#aaa27d',
    icons: [
      {
        src: '/Logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
