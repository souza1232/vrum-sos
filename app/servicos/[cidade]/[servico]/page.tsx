import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Wrench, Truck, Circle, Key, Zap, ArrowRight, MapPin, Clock, Shield, ChevronDown, ChevronRight } from 'lucide-react'
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

type ServicoConfig = {
  label: string
  labelLong: string
  icon: React.ElementType
  cor: string
  descricao: string
  keywords: (cidade: string) => string[]
  faqs: (cidade: string) => { q: string; a: string }[]
}

const SERVICOS: Record<string, ServicoConfig> = {
  mecanico: {
    label: 'Mecânico',
    labelLong: 'Mecânico Automotivo',
    icon: Wrench,
    cor: 'bg-blue-500',
    descricao: 'Reparos mecânicos completos para carros, motos e caminhões — manutenção preventiva, corretiva e revisão geral.',
    keywords: (c) => [
      `mecânico ${c}`, `mecânico automotivo ${c}`, `oficina mecânica ${c}`,
      `mecânico 24h ${c}`, `mecânico perto de mim ${c}`, `conserto de carro ${c}`,
      `revisão de carro ${c}`, `manutenção automotiva ${c}`,
    ],
    faqs: (c) => [
      { q: `Como encontrar um mecânico confiável em ${c}?`, a: `No Vrum SOS você encontra mecânicos verificados em ${c} com avaliações de outros motoristas. Basta buscar por "Mecânico" e selecionar ${c} — você vê o perfil completo do profissional, nota, comentários e o WhatsApp para contato direto.` },
      { q: `Tem mecânico 24 horas em ${c}?`, a: `Sim, alguns mecânicos cadastrados em ${c} atendem em horário estendido ou 24h para emergências na estrada. Na busca você pode ver a disponibilidade de cada profissional.` },
      { q: `Quanto custa um mecânico em ${c}?`, a: `O valor varia conforme o tipo de serviço e o profissional escolhido em ${c}. No Vrum SOS você entra em contato direto pelo WhatsApp antes de contratar, podendo pedir orçamento sem compromisso.` },
      { q: `O mecânico em ${c} vai até onde estou?`, a: `Muitos mecânicos em ${c} oferecem atendimento móvel — eles se deslocam até onde seu veículo está parado. Verifique no perfil do profissional ou pergunte pelo WhatsApp antes de confirmar.` },
      { q: `Como funciona o cadastro de mecânicos no Vrum SOS?`, a: `Todo mecânico em ${c} passa por análise antes de ser listado. Verificamos dados básicos e aguardamos avaliações de clientes para manter a qualidade da plataforma.` },
    ],
  },
  eletricista: {
    label: 'Eletricista Automotivo',
    labelLong: 'Eletricista Automotivo',
    icon: Zap,
    cor: 'bg-yellow-500',
    descricao: 'Diagnóstico e reparo de problemas elétricos em veículos — bateria, alternador, injeção eletrônica, ar-condicionado e muito mais.',
    keywords: (c) => [
      `eletricista automotivo ${c}`, `eletricista de carro ${c}`, `bateria fraca ${c}`,
      `alternador ${c}`, `injeção eletrônica ${c}`, `problema elétrico carro ${c}`,
      `scanner automotivo ${c}`, `ar condicionado carro ${c}`,
    ],
    faqs: (c) => [
      { q: `Meu carro não liga em ${c}, o que fazer?`, a: `Se o carro não liga pode ser bateria, alternador ou problema na partida. Um eletricista automotivo em ${c} faz o diagnóstico no local com scanner e resolve na hora na maioria dos casos. Busque pelo serviço "Eletricista" no Vrum SOS.` },
      { q: `Tem eletricista automotivo em ${c} que vai até mim?`, a: `Sim. Vários eletricistas em ${c} fazem atendimento móvel com scanner e ferramentas para diagnóstico no local. Verifique no perfil ou pergunte pelo WhatsApp.` },
      { q: `Quanto custa trocar a bateria em ${c}?`, a: `O custo da bateria e da mão de obra varia conforme o modelo do veículo. Pelo Vrum SOS você solicita orçamento diretamente para eletricistas em ${c} antes de fechar.` },
      { q: `Eletricista automotivo resolve problema de injeção eletrônica?`, a: `Sim. Os eletricistas listados em ${c} trabalham com scanner, reset de luz do painel, diagnóstico de falhas e reparo de injeção eletrônica.` },
      { q: `O ar-condicionado do meu carro parou em ${c}, quem chamo?`, a: `Um eletricista automotivo em ${c} pode diagnosticar o sistema elétrico do ar-condicionado. Para recarga de gás, consulte também se o profissional oferece esse serviço.` },
    ],
  },
  chaveiro: {
    label: 'Chaveiro',
    labelLong: 'Chaveiro Automotivo',
    icon: Key,
    cor: 'bg-purple-500',
    descricao: 'Abertura de veículos trancados, cópia de chaves, programação de transponder e chave canivete.',
    keywords: (c) => [
      `chaveiro ${c}`, `chaveiro automotivo ${c}`, `carro trancado ${c}`,
      `chave perdida ${c}`, `chaveiro 24h ${c}`, `abrir carro trancado ${c}`,
      `transponder ${c}`, `cópia de chave carro ${c}`,
    ],
    faqs: (c) => [
      { q: `Tranquei o carro com a chave dentro em ${c}, o que fazer?`, a: `Não force a fechadura. Chame um chaveiro automotivo em ${c} pelo Vrum SOS — profissionais verificados abrem o veículo sem danificar a trava, de forma rápida e segura.` },
      { q: `Tem chaveiro 24 horas em ${c}?`, a: `Sim. Muitos chaveiros em ${c} atendem emergências 24h, incluindo fins de semana e feriados. Busque no Vrum SOS e veja a disponibilidade de cada profissional.` },
      { q: `Quanto custa um chaveiro automotivo em ${c}?`, a: `O valor depende do serviço — abertura simples, cópia de chave ou programação de transponder têm preços diferentes. Contate o chaveiro em ${c} pelo WhatsApp para obter o orçamento antes de fechar.` },
      { q: `Chaveiro em ${c} faz programação de chave eletrônica?`, a: `Sim. Os chaveiros listados em ${c} incluem profissionais especializados em transponder, chave canivete e chave codificada para carros modernos.` },
      { q: `Perdi todas as chaves do carro em ${c}, consigo resolver?`, a: `Sim, um chaveiro automotivo em ${c} pode criar uma chave nova diretamente pelo VIN do veículo, sem precisar da chave original, em muitos modelos.` },
    ],
  },
  borracheiro: {
    label: 'Borracheiro',
    labelLong: 'Borracheiro',
    icon: Circle,
    cor: 'bg-green-500',
    descricao: 'Troca de pneus furados, remendo a frio e a quente, calibragem, balanceamento e alinhamento.',
    keywords: (c) => [
      `borracheiro ${c}`, `pneu furado ${c}`, `troca de pneu ${c}`,
      `borracheiro 24h ${c}`, `remendo de pneu ${c}`, `calibragem de pneu ${c}`,
      `balanceamento ${c}`, `borracheiro perto de mim ${c}`,
    ],
    faqs: (c) => [
      { q: `Furei o pneu em ${c}, o que faço?`, a: `Reduza a velocidade e pare em local seguro. Se não tiver estepe, chame um borracheiro em ${c} pelo Vrum SOS — muitos fazem atendimento na estrada e levam o pneu reserva ou fazem o remendo no local.` },
      { q: `Tem borracheiro 24 horas em ${c}?`, a: `Sim, há borracheiros em ${c} com atendimento noturno e em fins de semana. Na busca do Vrum SOS você vê quais estão disponíveis agora.` },
      { q: `Quanto custa remendar um pneu em ${c}?`, a: `O valor do remendo ou da troca varia conforme o tipo de pneu e o dano. Entre em contato pelo WhatsApp com o borracheiro em ${c} para confirmar o preço antes de chamar.` },
      { q: `Borracheiro em ${c} faz balanceamento e alinhamento?`, a: `Muitos borracheiros cadastrados em ${c} oferecem balanceamento e alguns também fazem alinhamento. Verifique no perfil do profissional quais serviços estão disponíveis.` },
      { q: `O borracheiro vai até onde eu estou?`, a: `Vários borracheiros em ${c} atendem na estrada, levando equipamento de remendo e pneus reserva. Informe sua localização pelo WhatsApp ao contatar o profissional.` },
    ],
  },
  guincho: {
    label: 'Guincho',
    labelLong: 'Guincho 24h',
    icon: Truck,
    cor: 'bg-red-500',
    descricao: 'Reboque de veículos de passeio 24h — carros, motos e utilitários leves para qualquer destino com segurança.',
    keywords: (c) => [
      `guincho ${c}`, `guincho 24h ${c}`, `reboque de carro ${c}`,
      `guincho barato ${c}`, `guincho perto de mim ${c}`, `socorro na estrada ${c}`,
      `carro quebrado ${c}`, `socorro automotivo ${c}`,
    ],
    faqs: (c) => [
      { q: `Como chamar um guincho em ${c}?`, a: `Pelo Vrum SOS você encontra guincheiros verificados em ${c} com WhatsApp e telefone visíveis. Clique em "Ver prestadores", selecione o guincho mais próximo e entre em contato direto — sem intermediário.` },
      { q: `Tem guincho 24 horas em ${c}?`, a: `Sim. Vários guincheiros em ${c} e região atendem 24h, incluindo madrugada, fins de semana e feriados. Busque por "Guincho" no Vrum SOS e veja quem está disponível agora.` },
      { q: `Quanto custa um guincho em ${c}?`, a: `O preço varia com a distância e o tipo do veículo. Pelo Vrum SOS você pede orçamento diretamente pelo WhatsApp com o guincheiro em ${c} antes de fechar.` },
      { q: `O guincho atende na rodovia perto de ${c}?`, a: `Sim. A maioria dos guincheiros cadastrados em ${c} cobre rodovias próximas e estradas vicinais da região. Informe o ponto exato pelo WhatsApp ao contatar o profissional.` },
      { q: `O guincho reboca moto também?`, a: `A maioria dos guincheiros em ${c} atende carros e motos. Confirme no perfil do prestador ou pergunte pelo WhatsApp se o equipamento é adequado para o seu veículo.` },
    ],
  },
  guincho_pesado: {
    label: 'Guincho Pesado',
    labelLong: 'Guincho Pesado',
    icon: Truck,
    cor: 'bg-orange-500',
    descricao: 'Reboque especializado para caminhões, ônibus, tratores, máquinas agrícolas e equipamentos pesados.',
    keywords: (c) => [
      `guincho pesado ${c}`, `guincho caminhão ${c}`, `reboque caminhão ${c}`,
      `socorro caminhão ${c}`, `guincho ônibus ${c}`, `guincho trator ${c}`,
      `guincho máquina pesada ${c}`, `guincho 24h caminhão ${c}`,
    ],
    faqs: (c) => [
      { q: `Tem guincho para caminhão em ${c}?`, a: `Sim. No Vrum SOS você encontra prestadores com equipamento de guincho pesado em ${c} e região, preparados para rebocar caminhões de carga, carretas e veículos acima de 3,5 toneladas.` },
      { q: `Guincho pesado atende 24h em ${c}?`, a: `Sim. Prestadores de guincho pesado em ${c} oferecem atendimento 24h para emergências na estrada. Busque no Vrum SOS e entre em contato direto.` },
      { q: `Quanto custa um guincho pesado em ${c}?`, a: `O valor depende do peso, tipo do veículo e distância do reboque. Entre em contato pelo WhatsApp com o prestador em ${c} para solicitar orçamento.` },
      { q: `Guincho pesado em ${c} reboca trator e máquina agrícola?`, a: `Muitos prestadores de guincho pesado em ${c} têm equipamento adequado para tratores e máquinas agrícolas. Confirme no perfil ou pelo WhatsApp antes de chamar.` },
      { q: `O guincho pesado cobre rodovias e estradas rurais em ${c}?`, a: `Sim. Prestadores na região de ${c} geralmente cobrem rodovias federais, estaduais e estradas vicinais. Informe a localização exata ao contatar pelo WhatsApp.` },
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(CIDADES).flatMap(cidade =>
    Object.keys(SERVICOS).map(servico => ({ cidade, servico }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: { cidade: string; servico: string }
}): Promise<Metadata> {
  const nomeCidade = CIDADES[params.cidade]
  const servico = SERVICOS[params.servico]
  if (!nomeCidade || !servico) return {}

  return {
    title: `${servico.labelLong} em ${nomeCidade} — 24h | Vrum SOS`,
    description: `Precisa de ${servico.label.toLowerCase()} em ${nomeCidade}? Encontre prestadores verificados, veja o WhatsApp e ligue direto. Atendimento 24h, sem cadastro.`,
    keywords: servico.keywords(nomeCidade),
    openGraph: {
      title: `${servico.labelLong} em ${nomeCidade} | Vrum SOS`,
      description: `Prestadores de ${servico.label.toLowerCase()} verificados em ${nomeCidade}. Contato direto pelo WhatsApp, atendimento 24h.`,
    },
  }
}

export default function ServicoNaCidadePage({
  params,
}: {
  params: { cidade: string; servico: string }
}) {
  const nomeCidade = CIDADES[params.cidade]
  const servico = SERVICOS[params.servico]
  if (!nomeCidade || !servico) notFound()

  const faqs = servico.faqs(nomeCidade)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const Icon = servico.icon

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
            <Link href={`/servicos/${params.cidade}`} className="hover:text-gray-300 transition-colors">{nomeCidade}</Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0" />
            <span className="text-gray-400">{servico.label}</span>
          </nav>
        </div>
      </div>

      {/* HERO */}
      <section className="bg-slate-900 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin className="w-3.5 h-3.5" />
            {nomeCidade} e região
          </div>
          <div className={`w-16 h-16 ${servico.cor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
            {servico.labelLong} em{' '}
            <span className="text-orange-400">{nomeCidade}</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            {servico.descricao} Prestadores verificados em {nomeCidade} — veja o WhatsApp e ligue direto, sem cadastro.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/buscar?tipo=${params.servico}&cidade=${encodeURIComponent(nomeCidade)}`}
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Ver {servico.label.toLowerCase()} em {nomeCidade}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/provider-register"
              className="inline-flex items-center justify-center gap-2 border-2 border-orange-500/40 hover:border-orange-500 text-orange-400 font-semibold px-8 py-4 rounded-xl transition-colors"
            >
              Sou {servico.label.toLowerCase()} em {nomeCidade}
            </Link>
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Clock, titulo: 'Atendimento 24h', descricao: `Prestadores de ${servico.label.toLowerCase()} em ${nomeCidade} disponíveis a qualquer hora, incluindo fins de semana.` },
              { icon: Shield, titulo: 'Prestadores verificados', descricao: `Todos os profissionais em ${nomeCidade} passam por análise antes de aparecer na plataforma.` },
              { icon: MapPin, titulo: 'Contato direto', descricao: `Fale pelo WhatsApp diretamente com o ${servico.label.toLowerCase()} em ${nomeCidade}. Sem intermediário.` },
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
            Dúvidas sobre {servico.label.toLowerCase()} em {nomeCidade}? Respondemos as principais.
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

      {/* OUTROS SERVIÇOS NA CIDADE */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Outros serviços em {nomeCidade}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(SERVICOS)
              .filter(([slug]) => slug !== params.servico)
              .map(([slug, s]) => (
                <Link
                  key={slug}
                  href={`/servicos/${params.cidade}/${slug}`}
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-orange-300 hover:shadow-sm text-slate-700 font-medium px-5 py-2.5 rounded-xl transition-all text-sm"
                >
                  <s.icon className="w-4 h-4 text-gray-500" />
                  {s.label}
                </Link>
              ))}
            <Link
              href={`/servicos/${params.cidade}`}
              className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 hover:border-orange-400 text-orange-700 font-medium px-5 py-2.5 rounded-xl transition-all text-sm"
            >
              Ver todos em {nomeCidade}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA PRESTADOR */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black text-white mb-4">
            É {servico.label.toLowerCase()} em {nomeCidade}?
          </h2>
          <p className="text-orange-100 mb-8 max-w-xl mx-auto">
            Cadastre-se gratuitamente e comece a receber chamados de clientes em {nomeCidade} e região.
          </p>
          <Link
            href="/provider-register"
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-orange-600 font-bold px-8 py-4 rounded-xl transition-colors"
          >
            Quero me cadastrar em {nomeCidade}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
