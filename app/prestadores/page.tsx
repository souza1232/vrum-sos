import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Wrench,
  Zap,
  Key,
  Circle,
  Truck,
  CheckCircle,
  ArrowRight,
  Users,
  TrendingUp,
  Star,
  Smartphone,
} from 'lucide-react'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Cadastre seu negócio | Vrum SOS',
  description: 'Apareça para clientes que precisam de socorro automotivo na sua região. Cadastro gratuito para mecânicos, guincheiros, borracheiros e chaveiros.',
}

const servicos = [
  { icon: Wrench, label: 'Mecânico', cor: 'bg-blue-500' },
  { icon: Zap, label: 'Eletricista Auto', cor: 'bg-yellow-500' },
  { icon: Key, label: 'Chaveiro', cor: 'bg-purple-500' },
  { icon: Circle, label: 'Borracheiro', cor: 'bg-green-500' },
  { icon: Truck, label: 'Guincho', cor: 'bg-red-500' },
  { icon: Truck, label: 'Guincho Pesado', cor: 'bg-orange-500' },
]

const beneficios = [
  {
    icon: Users,
    titulo: 'Mais clientes',
    descricao: 'Apareça para pessoas que estão procurando seu serviço agora mesmo na sua região.',
  },
  {
    icon: Smartphone,
    titulo: 'Contato direto',
    descricao: 'O cliente fala direto com você pelo WhatsApp. Sem intermediários.',
  },
  {
    icon: TrendingUp,
    titulo: 'Perfil profissional',
    descricao: 'Mostre seus serviços, fotos, avaliações e horário de atendimento.',
  },
  {
    icon: Star,
    titulo: 'Avaliações reais',
    descricao: 'Clientes avaliam seu atendimento. Boas avaliações geram mais confiança.',
  },
]

const passos = [
  { numero: '01', titulo: 'Crie sua conta grátis', descricao: 'Preencha seus dados e tipo de serviço. Leva menos de 2 minutos.' },
  { numero: '02', titulo: 'Aguarde a aprovação', descricao: 'Analisamos seu cadastro rapidamente para garantir a qualidade da plataforma.' },
  { numero: '03', titulo: 'Comece a receber clientes', descricao: 'Seu perfil aparece nas buscas. Clientes entram em contato diretamente.' },
]

export default function PrestadoresPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-black text-gray-900">Vrum <span className="text-orange-500">SOS</span></span>
          </Link>
          <Link
            href="/provider-register"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Cadastrar agora
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-orange-500/20 text-orange-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            100% gratuito para começar
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
            Apareça para clientes que precisam de você <span className="text-orange-500">agora</span>
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-xl mx-auto">
            Cadastre seu negócio na Vrum SOS e receba contatos de clientes com carro na mão na sua região.
          </p>
          <Link
            href="/provider-register"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors"
          >
            Criar perfil grátis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Tipos de serviço */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-500 text-sm font-semibold uppercase tracking-widest mb-8">Aceitamos esses tipos de serviço</p>
          <div className="flex flex-wrap justify-center gap-4">
            {servicos.map(({ icon: Icon, label, cor }) => (
              <div key={label} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm">
                <div className={`${cor} w-8 h-8 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Por que usar a Vrum SOS?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {beneficios.map(({ icon: Icon, titulo, descricao }) => (
              <div key={titulo} className="flex gap-4 p-6 bg-gray-50 rounded-2xl">
                <div className="bg-orange-500 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{titulo}</h3>
                  <p className="text-gray-500 text-sm">{descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-12">Como funciona</h2>
          <div className="space-y-6">
            {passos.map(({ numero, titulo, descricao }) => (
              <div key={numero} className="flex gap-5 items-start">
                <div className="text-4xl font-black text-orange-500 w-14 shrink-0">{numero}</div>
                <div className="pt-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{titulo}</h3>
                  <p className="text-gray-500">{descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O que está incluso */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4">Tudo isso de graça</h2>
          <p className="text-gray-500 mb-10">Sem taxa de adesão, sem mensalidade para começar.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-xl mx-auto mb-10">
            {[
              'Perfil completo com foto e descrição',
              'Aparece nas buscas por cidade e serviço',
              'Contato direto pelo WhatsApp',
              'Recebe avaliações de clientes',
              'Mostra horário de atendimento',
              'Contador de visualizações do perfil',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
          <Link
            href="/provider-register"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors"
          >
            Quero me cadastrar <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
