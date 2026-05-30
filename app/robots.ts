import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ofika.ci'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/', 
        '/admin/', 
        '/api/',
        '/api/*',
        '/dashboard/*',
        '/admin/*'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
