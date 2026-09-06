import { MetadataRoute } from 'next';
import { companyInfo } from './utils/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${companyInfo.url}/sitemap.xml`,
  };
}
