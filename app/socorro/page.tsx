'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Zap, AlertTriangle, Clock, CheckCircle, MessageCircle } from 'lucide-react'
import { TIPOS_SERVICO_LABELS, TipoServico } from '@/types'
import { whatsappLink } from '@/lib/utils'

const TIPOS = [
  { value: 'guincho', label: 'Guincho', cor: 'bg-red-500' },
  { value: 'mecanico', label: 'Mecânico', cor: 'bg-blue-500' },
  { value: 'borracheiro', label: 'Borracheiro', cor: 'bg-green-500' },
  { value: 'chaveiro', label: 'Chaveiro', cor: 'bg-purple-500' },
  { value: 'eletricista', label: 'Eletricista', cor: 'bg-yellow-500' },
  { value: 'guincho_pesado', label: 'Guincho Pesado', cor: 'bg-orange-500' },
]

function SocorroContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const tipoInicial = searchParams.get('tipo') ?? ''

  const [step, setStep] = useState<'form' | 'aguardando' | 'aceito'>('form')
  const [requestId, setRequestId] = useState<string | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [form, setForm] = useState({
    nome_cliente: '',
    telefone_cliente: '',
    tipo_servico: tipoInicial,
    cidade: '',
    observacao: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome_cliente || !form.telefone_cliente || !form.tipo_servico || !form.cidade) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    setError('')

    const { data, error: err } = await supabase
      .from('service_requests')
      .insert({
        nome_cliente: form.nome_cliente,
        telefone_cliente: form.telefone_cliente,
        tipo_servico: form.tipo_servico,
        cidade: form.cidade,
        observacao: form.observacao || null,
        status: 'pendente',
      })
      .select('id')
      .single()

    if (err || !data) {
      setError('Erro ao enviar. Tente novamente.')
      setLoading(false)
      return
    }

    setRequestId(data.id)
    setStep('aguardando')
    setLoading(false)

    // Dispara notificação push para prestadores da cidade
    fetch('/api/push/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipoServico: form.tipo_servico,
        cidade: form.cidade,
        title: `🚨 Chamado SOS — ${TIPOS_SERVICO_LABELS[form.tipo_servico as TipoServico]}`,
        body: `${form.nome_cliente} precisa de ajuda em ${form.cidade}`,
      }),
    })
  }

  useEffect(() => {
    if (!requestId) return

    const channel = supabase
      .channel(`socorro_${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'service_requests',
          filter: `id=eq.${requestId}`,
        },
        async (payload) => {
          if (payload.new.assigned_provider_id) {
            const { data: providerData } = await supabase
              .from('providers')
              .select('nome, nome_empresa, whatsapp, telefone, cidade')
              .eq('id', payload.new.assigned_provider_id)
              .single()

            setProvider(providerData)
            setStep('aceito')
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [requestId])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-black text-white">Vrum <span className="text-orange-500">SOS</span></span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {step === 'form' && (
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2">Precisa de socorro?</h1>
                <p className="text-gray-400">Preencha e avisamos os prestadores mais próximos agora.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">O que você precisa? *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIPOS.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, tipo_servico: t.value }))}
                        className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                          form.tipo_servico === t.value
                            ? `${t.cor} text-white scale-105`
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-1.5 block">Sua cidade *</label>
                  <input
                    type="text"
                    placeholder="Ex: Caravelas, BA"
                    value={form.cidade}
                    onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-1.5 block">Seu nome *</label>
                  <input
                    type="text"
                    placeholder="Como devemos te chamar?"
                    value={form.nome_cliente}
                    onChange={e => setForm(f => ({ ...f, nome_cliente: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-1.5 block">Seu WhatsApp *</label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={form.telefone_cliente}
                    onChange={e => setForm(f => ({ ...f, telefone_cliente: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-300 mb-1.5 block">
                    Descreva o problema <span className="text-gray-500 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    placeholder="Ex: Pneu furado na rodovia, preciso de guincho..."
                    value={form.observacao}
                    onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))}
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-black text-lg py-4 rounded-xl transition-colors"
                >
                  {loading ? 'Enviando...' : '🚨 Pedir socorro agora'}
                </button>
              </form>
            </div>
          )}

          {step === 'aguardando' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Avisando prestadores...</h2>
              <p className="text-gray-400 mb-6">
                Os prestadores de <strong className="text-white">{form.cidade}</strong> estão sendo notificados agora. Aguarde, alguém vai aceitar em breve.
              </p>
              <div className="bg-gray-800 rounded-2xl p-5 text-left space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Serviço</p>
                  <p className="text-white font-semibold">{TIPOS_SERVICO_LABELS[form.tipo_servico as TipoServico]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Cidade</p>
                  <p className="text-white font-semibold">{form.cidade}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Seu nome</p>
                  <p className="text-white font-semibold">{form.nome_cliente}</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-4">Esta página atualiza automaticamente quando alguém aceitar.</p>
            </div>
          )}

          {step === 'aceito' && provider && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Prestador a caminho!</h2>
              <p className="text-gray-400 mb-6">
                <strong className="text-white">{provider.nome_empresa || provider.nome}</strong> aceitou seu chamado. Entre em contato agora.
              </p>
              {provider.whatsapp && (
                <a
                  href={whatsappLink(
                    provider.whatsapp,
                    `Olá! Solicitei socorro pelo Vrum SOS. Preciso de ${TIPOS_SERVICO_LABELS[form.tipo_servico as TipoServico]} em ${form.cidade}. Sou ${form.nome_cliente}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black text-lg py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mb-4"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp
                </a>
              )}
              <div className="bg-gray-800 rounded-2xl p-5 text-left space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Prestador</p>
                  <p className="text-white font-semibold">{provider.nome_empresa || provider.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Cidade</p>
                  <p className="text-white font-semibold">{provider.cidade}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function SocorroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <SocorroContent />
    </Suspense>
  )
}
