'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Zap } from 'lucide-react'

const WHATSAPP_SUPORTE = '557399999999' // substitua pelo seu número

type Message = { role: 'user' | 'assistant'; content: string }

const FAQ: { palavras: string[]; resposta: string }[] = [
  {
    palavras: ['mecânico', 'mecanico', 'carro', 'conserto', 'reparo', 'oficina'],
    resposta: 'Para encontrar um mecânico, acesse a página de busca, selecione "Mecânico" e informe sua cidade ou use o GPS. Você verá os profissionais verificados com WhatsApp para contato direto! 🔧',
  },
  {
    palavras: ['guincho', 'reboque', 'rebocar', 'pane'],
    resposta: 'Temos guinchos 24h disponíveis! Acesse a busca, selecione "Guincho" e use o GPS para ver os mais próximos. Contato direto pelo WhatsApp do prestador. 🚛',
  },
  {
    palavras: ['borracheiro', 'pneu', 'furado', 'calibragem', 'balanceamento'],
    resposta: 'Para pneu furado ou calibragem, busque por "Borracheiro" na nossa plataforma. Vários profissionais atendem na estrada e vão até você! 🔵',
  },
  {
    palavras: ['chaveiro', 'chave', 'trancado', 'transponder'],
    resposta: 'Carro trancado? Busque por "Chaveiro" na plataforma. Profissionais verificados que abrem seu veículo sem danificar a fechadura. 🔑',
  },
  {
    palavras: ['elétric', 'eletric', 'bateria', 'alternador', 'injeção', 'injecao'],
    resposta: 'Para problemas elétricos, bateria fraca ou injeção eletrônica, busque por "Eletricista Automotivo". Eles fazem diagnóstico com scanner no local! ⚡',
  },
  {
    palavras: ['cadastr', 'prestador', 'anunciar', 'trabalhar', 'registr'],
    resposta: 'Para se cadastrar como prestador é gratuito! Acesse /provider-register, preencha seus dados e aguarde a aprovação em até 24h. Após aprovado, você aparece nas buscas da sua cidade. 🛠️',
  },
  {
    palavras: ['cidade', 'cidades', 'region', 'região', 'onde', 'atende'],
    resposta: 'Atendemos: Teixeira de Freitas, Caravelas, Posto da Mata, Alcobaça, Nova Viçosa, Mucuri (BA), Pedro Canário (ES) e Nanuque (MG). Em breve mais cidades! 📍',
  },
  {
    palavras: ['preço', 'preco', 'custo', 'valor', 'quanto', 'pago', 'grátis', 'gratis'],
    resposta: 'A plataforma é 100% gratuita para quem busca prestadores! O valor do serviço é combinado diretamente com o profissional pelo WhatsApp. 💰',
  },
  {
    palavras: ['funciona', 'como usar', 'como funciona', 'explicar'],
    resposta: 'Simples: busque o serviço que precisa → veja prestadores verificados → clique no WhatsApp → fale direto com o profissional. Sem cadastro, sem intermediário! ✅',
  },
  {
    palavras: ['avali', 'nota', 'estrela', 'comentário', 'comentario'],
    resposta: 'Após o atendimento, você pode avaliar o prestador acessando o link /avaliar/[id]. As avaliações ajudam outros motoristas a escolher bem! ⭐',
  },
  {
    palavras: ['aprovação', 'aprovacao', 'analise', 'análise', 'prazo'],
    resposta: 'O cadastro de prestadores é analisado em até 24 horas. Após aprovado, seu perfil aparece automaticamente nas buscas da sua região! ⏰',
  },
]

function responderFAQ(pergunta: string): string {
  const lower = pergunta.toLowerCase()
  for (const item of FAQ) {
    if (item.palavras.some(p => lower.includes(p))) {
      return item.resposta
    }
  }
  return `Não encontrei uma resposta automática para isso. Para falar com nossa equipe diretamente, clique no botão abaixo ou acesse a busca para encontrar prestadores. 😊`
}

const MENSAGENS_RAPIDAS = [
  'Como encontro um mecânico?',
  'Tem guincho 24h?',
  'Como me cadastrar como prestador?',
  'Quais cidades são atendidas?',
]

export default function ChatWidget() {
  const [aberto, setAberto] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [iniciado, setIniciado] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (aberto && !iniciado) {
      setIniciado(true)
      setMessages([{
        role: 'assistant',
        content: 'Olá! 👋 Sou o assistente do Vrum SOS. Como posso te ajudar hoje?',
      }])
    }
  }, [aberto, iniciado])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (aberto) setTimeout(() => inputRef.current?.focus(), 100)
  }, [aberto])

  function enviar(texto?: string) {
    const msg = (texto ?? input).trim()
    if (!msg) return

    const comUsuario: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(comUsuario)
    setInput('')

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: responderFAQ(msg) }])
    }, 400)
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setAberto(v => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Abrir chat de suporte"
      >
        {aberto
          ? <X className="w-6 h-6" />
          : <MessageCircle className="w-6 h-6" />
        }
      </button>

      {/* Janela do chat */}
      {aberto && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 120px)', height: '500px' }}
        >
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Vrum SOS</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <p className="text-gray-400 text-xs">Assistente online</p>
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Sugestões rápidas — só no início */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {MENSAGENS_RAPIDAS.map(q => (
                  <button
                    key={q}
                    onClick={() => enviar(q)}
                    className="text-xs bg-white border border-gray-200 hover:border-orange-400 hover:text-orange-600 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0 space-y-2">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-orange-400 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && enviar()}
                placeholder="Digite sua dúvida..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={() => enviar()}
                disabled={!input.trim()}
                className="w-7 h-7 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent('Olá! Preciso de ajuda com o Vrum SOS.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full text-xs text-green-700 hover:text-green-800 font-medium py-1 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Falar com atendente no WhatsApp
            </a>
          </div>
        </div>
      )}
    </>
  )
}
