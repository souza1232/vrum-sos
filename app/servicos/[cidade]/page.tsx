import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Wrench, Truck, Circle, Key, Zap, ArrowRight, MapPin, Clock, Shield, ChevronDown } from 'lucide-react'
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
  { slug: 'mecanico', label: 'Mecânico', icon: Wrench, cor: 'bg-blue-500', descricao: 'Reparos mecânicos, manutenção preventiva e corretiva para carros, motos e caminhões.' },
  { slug: 'eletricista', label: 'Eletricista Automotivo', icon: Zap, cor: 'bg-yellow-500', descricao: 'Diagnóstico e reparo de problemas elétricos, bateria fraca, alternador e injeção eletrônica.' },
  { slug: 'chaveiro', label: 'Chaveiro', icon: Key, cor: 'bg-purple-500', descricao: 'Abertura de veículos trancados, cópia de chaves e programação de transponder.' },
  { slug: 'borracheiro', label: 'Borracheiro', icon: Circle, cor: 'bg-green-500', descricao: 'Troca de pneus furados, remendo, calibragem e balanceamento na hora.' },
  { slug: 'guincho', label: 'Guincho', icon: Truck, cor: 'bg-red-500', descricao: 'Reboque de veículos 24h para qualquer destino, com segurança e rapidez.' },
  { slug: 'guincho_pesado', label: 'Guincho Pesado', icon: Truck, cor: 'bg-orange-500', descricao: 'Reboque especializado para caminhões, ônibus, tratores e máquinas pesadas.' },
]

export async function generateStaticParams() {
  return Object.keys(CIDADES).map(cidade => ({ cidade }))
}

export async function generateMetadata({ params }: { params: { cidade: string } }): Promise<Metadata> {
  const nomeCidade = CIDADES[params.cidade]
  if (!nomeCidade) return {}

  return {
    title: `Mecânico, Guincho e Chaveiro em ${nomeCidade} — Assistência 24h | Vrum SOS`,
    description: `Precisa de mecânico, guincho, borracheiro ou chaveiro em ${nomeCidade}? Encontre prestadores verificados, veja o WhatsApp e ligue direto. Sem cadastro, atendimento 24h.`,
    keywords: [
      `mecânico ${nomeCidade}`,
      `guincho ${nomeCidade}`,
      `borracheiro ${nomeCidade}`,
      `chaveiro ${nomeCidade}`,
      `eletricista automotivo ${nomeCidade}`,
      `assistência automotiva ${nomeCidade}`,
      `socorro automotivo ${nomeCidade}`,
      `guincho 24h ${nomeCidade}`,
      `mecânico perto de mim ${nomeCidade}`,
      `carro quebrado ${nomeCidade}`,
      `socorro veicular ${nomeCidade}`,
      `guincho barato ${nomeCidade}`,
    ],
    openGraph: {
      title: `Mecânico, Guincho e Chaveiro em ${nomeCidade} | Vrum SOS`,
      description: `Prestadores verificados em ${nomeCidade}. Contato direto pelo WhatsApp, atendimento 24h. Sem cadastro!`,
    },
  }
}

export default function CidadePage({ params }: { params: { cidade: string } }) {
  const nomeCidade = CIDADES[params.cidade]
  if (!nomeCidade) notFound()

  const faqs = [
    {
      q: `Como encontrar um mecânico em ${nomeCidade}?`,
      a: `No Vrum SOS você busca mecânicos em ${nomeCidade} sem precisar criar conta. Basta acessar a busca, digitar ${nomeCidade} ou usar seu GPS, e ver os prestadores disponíveis com WhatsApp e telefone para contato direto.`,
    },
    {
      q: `Tem guincho 24 horas em ${nomeCidade}?`,
      a: `Sim. Vários prestadores cadastrados em ${nomeCidade} e região atendem 24h, incluindo fins de semana e feriados. Você pode filtrar por "Guincho" na busca e ver quais estão disponíveis agora.`,
    },
    {
      q: `Como funciona o Vrum SOS em ${nomeCidade}?`,
      a: `O Vrum SOS conecta motoristas com prestadores automotivos verificados em ${nomeCidade}. Você busca pelo serviço que precisa, vê o perfil do prestador com avaliações de outros clientes, e entra em contato direto pelo WhatsApp ou telefone — sem intermediário.`,
    },
    {
      q: `O atendimento é pago?`,
      a: `A plataforma Vrum SOS é gratuita para quem busca prestadores. O valor do serviço automotivo é combinado diretamente com o prestador em ${nomeCidade}.`,
    },
    {
      q: `Como me cadastrar como prestador em ${nomeCidade}?`,
      a: `O cadastro é gratuito. Acesse "Quero ser prestador", preencha seus dados e serviços oferecidos em ${nomeCidade}, e aguarde a aprovação. Após aprovado, seu perfil aparece nas buscas dos motoristas da região.`,
    },
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://vrumsos.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Serviços por cidade', item: 'https://vrumsos.com.br/servicos' },
      { '@type': 'ListItem', position: 3, name: nomeCidade, item: `https://vrumsos.com.br/servicos/${params.cidade}` },
    ],
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

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
            Mecânico, Guincho e Chaveiro em{' '}
            <span className="text-orange-400">{nomeCidade}</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Carro quebrado em {nomeCidade}? Encontre mecânicos, guinchos, borracheiros e chaveiros
            verificados perto de você. Veja o WhatsApp e ligue direto — sem cadastro.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/buscar?cidade=${encodeURIComponent(nomeCidade)}`}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Ver prestadores em {nomeCidade}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/provider-register"
              className="inline-flex items-center justify-center gap-2 border-2 border-orange-500/40 hover:border-orange-500 text-orange-400 font-semibold px-8 py-4 rounded-xl transition-colors"
            >
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
            Clique no serviço que você precisa e veja os prestadores disponíveis agora — sem cadastro.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICOS.map(s => (
              <Link
                key={s.slug}
                href={`/buscar?tipo=${s.slug}&cidade=${encodeURIComponent(nomeCidade)}`}
                className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-orange-300 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${s.cor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.label} em {nomeCidade}</h3>
                <p className="text-sm text-gray-500 mb-4">{s.descricao}</p>
                <span className="text-sm font-semibold text-orange-500 group-hover:text-orange-600 flex items-center gap-1">
                  Ver prestadores <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Clock, titulo: 'Atendimento 24h', descricao: `Prestadores em ${nomeCidade} disponíveis a qualquer hora, incluindo fins de semana e feriados.` },
              { icon: Shield, titulo: 'Prestadores verificados', descricao: `Todos os profissionais em ${nomeCidade} passam por análise antes de aparecer na plataforma.` },
              { icon: MapPin, titulo: 'Contato direto', descricao: `Fale pelo WhatsApp ou ligue direto para o prestador em ${nomeCidade}. Sem intermediário.` },
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

      {/* FAQ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-gray-500 text-center mb-12">
            Dúvidas sobre assistência automotiva em {nomeCidade}? Respondemos as principais.
          </p>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-slate-900 text-sm sm:text-base list-none">
                  {faq.q}
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 ml-3 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA PRESTADOR */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            É prestador em {nomeCidade}?
          </h2>
          <p className="text-orange-100 mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente e comece a receber chamados de clientes em {nomeCidade} e região. Sem mensalidade para começar.
          </p>
          <Link
            href="/provider-register"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-orange-600 font-bold px-8 py-4 rounded-xl transition-colors"
          >
            Quero ser prestador em {nomeCidade}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
