import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/register', '/login', '/provider-register', '/provider-login', '/termos', '/privacidade'],
        disallow: ['/dashboard/', '/painel/', '/admin/'],
      },
    ],
    sitemap: 'https://vrumsos.com.br/sitemap.xml',
  }
}
