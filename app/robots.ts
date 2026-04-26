import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/buscar',
          '/register',
          '/login',
          '/provider-register',
          '/provider-login',
          '/termos',
          '/privacidade',
          '/servicos/',
          '/p/',
        ],
        disallow: ['/dashboard/', '/painel/', '/admin/'],
      },
    ],
    sitemap: 'https://vrumsos.com.br/sitemap.xml',
  }
}
