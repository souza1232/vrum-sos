import { Metadata } from 'next'
import Link from 'next/link'
import { Wrench, Truck, Circle, Key, Zap, ArrowRight, MapPin, ChevronRight } from 'lucide-react'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Mecânico, Guincho e Chaveiro por Cidade — Vrum SOS',
  description: 'Encontre mecânicos, guinchos, borracheiros e chaveiros verificados na sua cidade. Atendimento 24h, contato direto pelo WhatsApp. Selecione sua cidade.',
  keywords: [
    'mecânico perto de mim', 'guincho 24h', 'borracheiro', 'chaveiro automotivo',
    'assistência automotiva', 'socorro veicular', 'eletricista automotivo',
    'mecânico Teixeira de Freitas', 'guincho Caravelas', 'borracheiro Nanuque',
  ],
  openGraph: {
    title: 'Assistência Automotiva por Cidade | Vrum SOS',
    description: 'Prestadores verificados de mecânico, guincho, borracheiro e chaveiro em cada cidade. Atendimento 24h.',
  },
}

const CIDADES = [
  { slug: 'teixeira-de-freitas', nome: 'Teixeira de Freitas', estado: 'BA' },
  { slug: 'caravelas', nome: 'Caravelas', estado: 'BA' },
  { slug: 'posto-da-mata', nome: 'Posto da Mata', estado: 'BA' },
  { slug: 'alcobaca', nome: 'Alcobaça', estado: 'BA' },
  { slug: 'nova-vicosa', nome: 'Nova Viçosa', estado: 'BA' },
  { slug: 'mucuri', nome: 'Mucuri', estado: 'BA' },
  { slug: 'pedro-canario', nome: 'Pedro Canário', estado: 'ES' },
  { slug: 'nanuque', nome: 'Nanuque', estado: 'MG' },
]

const SERVICOS = [
  { slug: 'mecanico', label: 'Mecânico', icon: Wrench, cor: 'bg-blue-500' },
  { slug: 'eletricista', label: 'Eletricista Automotivo', icon: Zap, cor: 'bg-yellow-500' },
  { slug: 'chaveiro', label: 'Chaveiro', icon: Key, cor: 'bg-purple-500' },
  { slug: 'borracheiro', label: 'Borracheiro', icon: Circle, cor: 'bg-green-500' },
  { slug: 'guincho', label: 'Guincho 24h', icon: Truck, cor: 'bg-red-500' },
  { slug: 'guincho_pesado', label: 'Guincho Pesado', icon: Truck, cor: 'bg-orange-500' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Cidades com assistência automotiva — Vrum SOS',
  itemListElement: CIDADES.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.nome,
    url: `https://vrumsos.com.br/servicos/${c.slug}`,
  })),
}

export default function ServicosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* NAVBAR */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Vrum <span className="text-orange-400">SOS</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white hidden sm:block">Entrar</Link>
            <Link href="/register" className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg">Criar conta</Link>
          </div>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 pb-3">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-gray-300 transition-colors">Início</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-gray-400">Serviços por cidade</span>
          </nav>
        </div>
      </div>

      {/* HERO */}
      <section className="bg-slate-900 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-3.5 h-3.5" />
            Sul da Bahia, Espírito Santo e Minas Gerais
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Assistência Automotiva{' '}
            <span className="text-orange-400">por Cidade</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Selecione sua cidade e encontre mecânicos, guinchos, borracheiros e chaveiros
            verificados perto de você — contato direto pelo WhatsApp, sem cadastro.
          </p>
          <Link
            href="/buscar"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors"
          >
            Buscar agora com minha localização
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* CIDADES */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Escolha sua cidade
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Clique na cidade para ver todos os serviços disponíveis ou escolha diretamente o serviço que precisa.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CIDADES.map(cidade => (
              <div key={cidade.slug} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-orange-300 hover:shadow-md transition-all group">
                {/* Header da cidade */}
                <Link
                  href={`/servicos/${cidade.slug}`}
                  className="flex items-center justify-between px-5 py-4 border-b border-gray-100 group-hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{cidade.nome}</p>
                      <p className="text-xs text-gray-400">{cidade.estado}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors" />
                </Link>

                {/* Serviços da cidade */}
                <div className="px-5 py-3 flex flex-wrap gap-1.5">
                  {SERVICOS.map(s => (
                    <Link
                      key={s.slug}
                      href={`/servicos/${cidade.slug}/${s.slug}`}
                      className="text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors"
                    >
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVIÇOS DISPONÍVEIS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Serviços disponíveis
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Selecione o serviço e depois a cidade, ou use a busca para filtrar por GPS.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {SERVICOS.map(s => (
              <Link
                key={s.slug}
                href={`/buscar?tipo=${s.slug}`}
                className="group flex flex-col items-center bg-white border border-gray-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-sm transition-all text-center"
              >
                <div className={`w-12 h-12 ${s.cor} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700 leading-tight">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TABELA CIDADE x SERVIÇO */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
            Todos os serviços por cidade
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="text-left px-5 py-4 font-semibold">Cidade</th>
                  {SERVICOS.map(s => (
                    <th key={s.slug} className="px-3 py-4 font-semibold text-center whitespace-nowrap">
                      {s.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CIDADES.map((cidade, i) => (
                  <tr key={cidade.slug} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-5 py-3 font-medium text-slate-900">
                      <Link href={`/servicos/${cidade.slug}`} className="hover:text-orange-500 transition-colors flex items-center gap-1.5">
                        {cidade.nome}
                        <span className="text-xs text-gray-400">{cidade.estado}</span>
                      </Link>
                    </td>
                    {SERVICOS.map(s => (
                      <td key={s.slug} className="px-3 py-3 text-center">
                        <Link
                          href={`/servicos/${cidade.slug}/${s.slug}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-500 transition-colors mx-auto"
                          title={`${s.label} em ${cidade.nome}`}
                        >
                          <s.icon className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            É prestador em alguma dessas cidades?
          </h2>
          <p className="text-orange-100 mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente e apareça nas buscas dos motoristas da sua região.
          </p>
          <Link
            href="/provider-register"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-orange-600 font-bold px-8 py-4 rounded-xl transition-colors"
          >
            Quero ser prestador
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
