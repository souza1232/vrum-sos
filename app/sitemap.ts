import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://vrumsos.com.br'

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/provider-login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/provider-register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/termos`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacidade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
