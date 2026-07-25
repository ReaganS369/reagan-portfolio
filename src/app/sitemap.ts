import { MetadataRoute } from 'next';
import { SEO_CONFIG } from '@/src/config/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/builds', '/comms', '/origin', '/stats'];

  return routes.map((route) => ({
    url: `${SEO_CONFIG.baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'monthly' : 'yearly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
