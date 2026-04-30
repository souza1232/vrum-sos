import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, Wrench, Truck, Key, Circle, Zap, Clock, ArrowRight } from 'lucide-react'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Assistência Automotiva em Nova Viçosa BA — Mecânico, Guincho e Borracheiro',
  description: 'Precisa de mecânico, guincho, borracheiro ou chaveiro em Nova Viçosa? Encontre prestadores automotivos disponíveis 24h em Nova Viçosa e região. Atendimento rápido pelo WhatsApp.',
  keywords: [
    'mecânico em Nova Viçosa',
    'guincho em Nova Viçosa',
    'borracheiro em Nova Viçosa',
    'chaveiro automotivo Nova Viçosa',
    'eletricista automotivo Nova Viçosa',
    'guincho pesado Nova Viçosa',
    'assistência automotiva Nova Viçosa BA',
    'socorro automotivo Nova Viçosa',
    'carro quebrado Nova Viçosa',
    'mecânico 24h Nova Viçosa',
    'guincho 24h Nova Viçosa Bahia',
  ],
  alternates: {
    canonical: 'https://vrumsos.com.br/nova-vicosa',
  },
  openGraph: {
    title: 'Assistência Automotiva em Nova Viçosa BA | Vrum SOS',
    description: 'Mecânico, guincho, borracheiro e chaveiro em Nova Viçosa. Atendimento 24h pelo WhatsApp.',
    url: 'https://vrumsos.com.br/nova-vicosa',
  },
}

const servicos = [
  { icon: Wrench, label: 'Mecânico', cor: 'bg-blue-500' },
  { icon: Zap, label: 'Eletricista Auto', cor: 'bg-yellow-500' },
  { icon: Key, label: 'Chaveiro', cor: 'bg-purple-500' },
  { icon: Circle, label: 'Borracheiro', cor: 'bg-green-500' },
  { icon: Truck, label: 'Guincho', cor: 'bg-red-500' },
  { icon: Truck, label: 'Guincho Pesado', cor: 'bg-orange-500' },
]

export default function NovaVicosaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Vrum <span className="text-orange-400">SOS</span></span>
          </Link>
          <Link href="/socorro" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            Pedir socorro
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-4 h-4" />
            Nova Viçosa, Bahia
          </div>
          <h1 className="text-3xl sm:text-4xl font-black mb-4">
            Assistência Automotiva em <span className="text-orange-400">Nova Viçosa</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Mecânico, guincho, borracheiro e chaveiro em Nova Viçosa e região. Encontre o prestador mais próximo e entre em contato direto pelo WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/socorro?cidade=Nova Viçosa"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-lg"
            >
              Buscar socorro agora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/buscar?cidade=Nova Viçosa"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/10 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              Ver prestadores em Nova Viçosa
            </Link>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 text-center mb-2">
            Serviços disponíveis em Nova Viçosa
          </h2>
          <p className="text-gray-500 text-center mb-8">
            Encontre o especialista certo para o seu problema
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {servicos.map(s => (
              <Link
                key={s.label}
                href={`/socorro?cidade=Nova Viçosa&servico=${s.label}`}
                className="bg-white rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-md p-5 flex flex-col items-center gap-3 transition-all"
              >
                <div className={`w-12 h-12 ${s.cor} rounded-xl flex items-center justify-center`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-semibold text-gray-800 text-sm text-center">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Urgência */}
      <section className="py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-900 rounded-2xl p-8 text-white text-center">
            <Clock className="w-10 h-10 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black mb-2">Carro quebrado em Nova Viçosa?</h2>
            <p className="text-gray-300 mb-6">
              Não fique esperando. Encontre prestadores disponíveis agora, incluindo atendimento 24h e emergencial.
            </p>
            <Link
              href="/socorro?cidade=Nova Viçosa"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors"
            >
              Pedir ajuda agora
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Regiões próximas */}
      <section className="py-10 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Também atendemos as regiões próximas</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {['Mucuri', 'Alcobaça', 'Caravelas', 'Teixeira de Freitas', 'Prado'].map(cidade => (
              <Link
                key={cidade}
                href={`/socorro?cidade=${encodeURIComponent(cidade)}`}
                className="text-sm font-medium text-gray-600 hover:text-orange-500 bg-white border border-gray-200 hover:border-orange-300 px-4 py-2 rounded-full transition-colors"
              >
                {cidade}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
