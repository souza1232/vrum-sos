import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE = 'https://vrumsos.com.br'

const CIDADES = [
  'teixeira-de-freitas',
  'caravelas',
  'posto-da-mata',
  'alcobaca',
  'nova-vicosa',
  'mucuri',
  'pedro-canario',
  'nanuque',
]

const SERVICOS = [
  'mecanico',
  'eletricista',
  'chaveiro',
  'borracheiro',
  'guincho',
  'guincho_pesado',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const { data: providers } = await supabase
    .from('providers')
    .select('id, updated_at')
    .eq('status_aprovacao', 'aprovado')

  const providerUrls: MetadataRoute.Sitemap = (providers ?? []).map(p => ({
    url: `${BASE}/p/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const cidadeUrls: MetadataRoute.Sitemap = CIDADES.map(c => ({
    url: `${BASE}/servicos/${c}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const cidadeServicoUrls: MetadataRoute.Sitemap = CIDADES.flatMap(c =>
    SERVICOS.map(s => ({
      url: `${BASE}/servicos/${c}/${s}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  )

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/buscar`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/servicos`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/provider-register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/provider-login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/termos`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacidade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ...cidadeUrls,
    ...cidadeServicoUrls,
    ...providerUrls,
  ]
}
