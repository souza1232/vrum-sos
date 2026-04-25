import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Wrench, Truck, Circle, Key, Zap, ArrowRight, MapPin, Clock, Shield } from 'lucide-react'
import Footer from '@/components/layout/Footer'

const CIDADES: Record<string, string> = {
  'teixeira-de-freitas': 'Teixeira de Freitas',
  'caravelas': 'Caravelas',
  'posto-da-mata': 'Posto da Mata',
  'alcobaca': 'Alcobaça',
  'nova-vicosa': 'Nova Viçosa',
  'mucuri': 'Mucuri',
  'pedro-canario': 'Pedro Canário',
  'nanuque': 'Nanuque',
}

const SERVICOS = [
  { slug: 'mecanico', label: 'Mecânico', icon: Wrench, cor: 'bg-blue-500', descricao: 'Reparos mecânicos, manutenção preventiva e corretiva' },
  { slug: 'eletricista', label: 'Eletricista Automotivo', icon: Zap, cor: 'bg-yellow-500', descricao: 'Problemas elétricos, bateria, alternador e muito mais' },
  { slug: 'chaveiro', label: 'Chaveiro', icon: Key, cor: 'bg-purple-500', descricao: 'Abertura de veículos, cópias de chave e transponder' },
  { slug: 'borracheiro', label: 'Borracheiro', icon: Circle, cor: 'bg-green-500', descricao: 'Troca de pneus, remendo e balanceamento' },
  { slug: 'guincho', label: 'Guincho', icon: Truck, cor: 'bg-red-500', descricao: 'Reboque e transporte de veículos 24h' },
  { slug: 'guincho-pesado', label: 'Guincho Pesado', icon: Truck, cor: 'bg-orange-500', descricao: 'Reboque de caminhões, ônibus e máquinas pesadas' },
]

export async function generateStaticParams() {
  return Object.keys(CIDADES).map(cidade => ({ cidade }))
}

export async function generateMetadata({ params }: { params: { cidade: string } }): Promise<Metadata> {
  const nomeCidade = CIDADES[params.cidade]
  if (!nomeCidade) return {}

  return {
    title: `Assistência Automotiva em ${nomeCidade} — Mecânico, Guincho e mais | Vrum SOS`,
    description: `Encontre mecânicos, guinchos, borracheiros, chaveiros e eletricistas automotivos em ${nomeCidade} e região. Atendimento 24h, rápido e confiável. Cadastre-se grátis!`,
    keywords: [
      `mecânico ${nomeCidade}`,
      `guincho ${nomeCidade}`,
      `borracheiro ${nomeCidade}`,
      `chaveiro ${nomeCidade}`,
      `eletricista automotivo ${nomeCidade}`,
      `assistência automotiva ${nomeCidade}`,
      `socorro automotivo ${nomeCidade}`,
      `guincho 24h ${nomeCidade}`,
      `mecânico perto ${nomeCidade}`,
      `prestador automotivo ${nomeCidade}`,
    ],
    openGraph: {
      title: `Assistência Automotiva em ${nomeCidade} | Vrum SOS`,
      description: `Mecânicos, guinchos, borracheiros e chaveiros em ${nomeCidade}. Atendimento 24h!`,
    },
  }
}

export default function CidadePage({ params }: { params: { cidade: string } }) {
  const nomeCidade = CIDADES[params.cidade]
  if (!nomeCidade) notFound()

  return (
    <div className="min-h-screen flex flex-col bg-white">
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

      {/* HERO */}
      <section className="bg-slate-900 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-3.5 h-3.5" />
            {nomeCidade} e região
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Assistência Automotiva em{' '}
            <span className="text-orange-400">{nomeCidade}</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Encontre mecânicos, guinchos, borracheiros, chaveiros e eletricistas em {nomeCidade}.
            Prestadores verificados, atendimento 24h e contato direto pelo WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors">
              Preciso de ajuda agora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/provider-register" className="inline-flex items-center justify-center gap-2 border-2 border-orange-500/40 hover:border-orange-500 text-orange-400 font-semibold px-8 py-4 rounded-xl transition-colors">
              Sou prestador em {nomeCidade}
            </Link>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Serviços disponíveis em {nomeCidade}
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Conectamos você ao profissional certo, na hora certa.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICOS.map(s => (
              <div key={s.slug} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-200 hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${s.cor} rounded-xl flex items-center justify-center mb-4`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.label} em {nomeCidade}</h3>
                <p className="text-sm text-gray-500 mb-4">{s.descricao}</p>
                <Link href="/register" className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">
                  Encontrar profissional <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Clock, titulo: 'Atendimento 24h', descricao: `Prestadores disponíveis a qualquer hora em ${nomeCidade}` },
              { icon: Shield, titulo: 'Prestadores verificados', descricao: 'Todos passam por análise antes de entrar na plataforma' },
              { icon: MapPin, titulo: `Perto de você`, descricao: `Profissionais que atendem em ${nomeCidade} e região` },
            ].map((d, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <d.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{d.titulo}</h3>
                <p className="text-sm text-gray-500">{d.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            É prestador em {nomeCidade}?
          </h2>
          <p className="text-orange-100 mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente e comece a receber chamados de clientes em {nomeCidade} e região.
          </p>
          <Link href="/provider-register" className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-orange-600 font-bold px-8 py-4 rounded-xl transition-colors">
            Quero ser prestador em {nomeCidade}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
