import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Existing admin route discovered during audit
    },
    sitemap: 'https://reagan.nngtw.com/sitemap.xml',
  };
}
