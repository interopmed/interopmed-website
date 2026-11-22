import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/account/', '/user/', '/api/'],
    },
    sitemap: 'https://www.interopmed.com/sitemap.xml',
  }
}
