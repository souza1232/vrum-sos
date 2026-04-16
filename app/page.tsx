import Link from 'next/link'
import {
  Zap,
  Wrench,
  Zap as ElectricIcon,
  Key,
  Circle,
  Truck,
  ChevronRight,
  Clock,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import Footer from '@/components/layout/Footer'
import CarAnimation from '@/components/ui/CarAnimation'

const servicos = [
  { icon: Wrench, label: 'Mecânico', cor: 'bg-blue-500' },
  { icon: ElectricIcon, label: 'Eletricista Auto', cor: 'bg-yellow-500' },
  { icon: Key, label: 'Chaveiro', cor: 'bg-purple-500' },
  { icon: Circle, label: 'Borracheiro', cor: 'bg-green-500' },
  { icon: Truck, label: 'Guincho', cor: 'bg-red-500' },
  { icon: Truck, label: 'Guincho Pesado', cor: 'bg-orange-500' },
]

const diferenciais = [
  {
    icon: Clock,
    titulo: 'Atendimento rápido',
    descricao: 'Encontre prestadores disponíveis 24h, incluindo finais de semana e feriados.',
  },
  {
    icon: Shield,
    titulo: 'Prestadores verificados',
    descricao: 'Todos os prestadores passam por análise antes de aparecer na plataforma.',
  },
  {
    icon: MapPin,
    titulo: 'Na sua região',
    descricao: 'Filtre por cidade e encontre o prestador mais próximo de você.',
  },
  {
    icon: Star,
    titulo: 'Vários especialistas',
    descricao: 'Mecânicos, guinchos, borracheiros, chaveiros e muito mais.',
  },
]

const passos = [
  { numero: '01', titulo: 'Crie sua conta', descricao: 'Cadastro simples e gratuito em menos de 2 minutos.' },
  { numero: '02', titulo: 'Busque um prestador', descricao: 'Filtre por tipo de serviço e cidade para encontrar o profissional certo.' },
  { numero: '03', titulo: 'Entre em contato', descricao: 'Fale diretamente pelo WhatsApp ou solicite atendimento pela plataforma.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* NAVBAR */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Vrum <span className="text-orange-400">SOS</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-slate-900 relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-500 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                <Zap className="w-3.5 h-3.5" />
                Assistência automotiva na palma da mão
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 text-balance">
                Seu carro parou?{' '}
                <span className="text-orange-400">A gente resolve.</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-xl">
                Conectamos você com mecânicos, guinchos, borracheiros, chaveiros e muito mais —
                perto de você, agora mesmo. Rápido, confiável e verificado.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-orange-500/30 active:scale-95"
                >
                  Começar agora
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 border-2 border-slate-600 hover:border-slate-400 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors"
                >
                  Já tenho conta
                </Link>
                <Link
                  href="/provider-register"
                  className="inline-flex items-center gap-2 border-2 border-orange-500/40 hover:border-orange-500 text-orange-400 hover:text-orange-300 font-semibold px-8 py-4 rounded-xl text-base transition-colors"
                >
                  Quero ser prestador
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Animação do carro */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-full max-w-md">
                <CarAnimation />
                {/* Texto abaixo do carro */}
                <div className="flex justify-center gap-6 mt-4">
                  {[
                    { label: '500+', desc: 'Prestadores' },
                    { label: '24h', desc: 'Disponível' },
                    { label: '4.9★', desc: 'Avaliação' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <p className="text-orange-400 font-black text-lg">{item.label}</p>
                      <p className="text-gray-500 text-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Todos os serviços que você precisa
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              De pequenos reparos a emergências na estrada — temos o especialista certo para você.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {servicos.map((s) => (
              <div
                key={s.label}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50 transition-all cursor-default"
              >
                <div className={`w-12 h-12 ${s.cor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center leading-tight">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-gray-500">Em 3 passos simples você já consegue o suporte que precisa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {passos.map((passo, i) => (
              <div key={i} className="relative">
                {i < passos.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-orange-100 -translate-x-8 z-0" />
                )}
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:border-orange-200 transition-colors">
                  <div className="text-5xl font-black text-orange-100 mb-4">{passo.numero}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{passo.titulo}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{passo.descricao}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Por que usar o Vrum SOS?
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                Desenvolvemos uma plataforma pensada em urgência, praticidade e confiança para quem precisa de suporte automotivo.
              </p>
              <div className="space-y-4">
                {diferenciais.map((d, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <d.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-0.5">{d.titulo}</h3>
                      <p className="text-sm text-gray-500">{d.descricao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-8 lg:p-12">
              <div className="space-y-4 mb-8">
                {['Prestadores verificados pela plataforma', 'Contato direto pelo WhatsApp', 'Disponível 24h, finais de semana e feriados', 'Filtros por cidade e tipo de serviço', 'Cadastro rápido e gratuito'].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Criar conta gratuita
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA PRESTADOR */}
      <section className="py-16 sm:py-24 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Você é prestador de serviço?
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente e comece a receber chamados de clientes próximos a você.
          </p>
          <Link
            href="/provider-register"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-orange-600 font-bold px-8 py-4 rounded-xl text-base transition-colors"
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
