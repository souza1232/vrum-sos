'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProviderLayout from '@/components/layout/ProviderLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { FileText, Check, X, RefreshCw, AlertCircle, Siren, MessageCircle } from 'lucide-react'
import { whatsappLink } from '@/lib/utils'

interface RequestWithUser {
  id: string
  tipo_servico: string
  cidade: string
  observacao: string | null
  status: string
  created_at: string
  user_id: string | null
  provider_id: string | null
  assigned_provider_id: string | null
  nome_cliente: string | null
  telefone_cliente: string | null
  user: { nome: string; email: string } | null
}

const tipoLabel: Record<string, string> = {
  mecanico: 'Mecânico',
  eletricista: 'Eletricista Automotivo',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  guincho: 'Guincho',
  guincho_pesado: 'Guincho Pesado',
}

export default function ProviderSolicitacoesPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<RequestWithUser[]>([])
  const [sosRequests, setSosRequests] = useState<RequestWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ nome: string } | null>(null)
  const [providerId, setProviderId] = useState<string | null>(null)
  const [providerData, setProviderData] = useState<{ tipos_servico: string[]; cidade: string } | null>(null)
  const [isApproved, setIsApproved] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('nome')
        .eq('id', user.id)
        .single()

      setProfile(profileData as any)

      const { data: pData } = await supabase
        .from('providers')
        .select('id, status_aprovacao, tipos_servico, cidade')
        .eq('profile_id', user.id)
        .single()

      if (pData) {
        setProviderId(pData.id)
        setProviderData({ tipos_servico: pData.tipos_servico, cidade: pData.cidade })
        setIsApproved(pData.status_aprovacao === 'aprovado')

        await Promise.all([
          fetchRequests(pData.id),
          fetchSosRequests(pData.tipos_servico, pData.cidade),
        ])

        // Realtime: novas solicitações direcionadas a este prestador
        const channelDirect = supabase
          .channel(`solicitacoes_${pData.id}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'service_requests',
            filter: `provider_id=eq.${pData.id}`,
          }, async (payload) => {
            const { data: userData } = await supabase
              .from('profiles')
              .select('nome, email')
              .eq('id', payload.new.user_id)
              .single()

            const nova: RequestWithUser = { ...(payload.new as any), user: userData ?? null }
            setRequests(prev => [nova, ...prev])
            showToast(`Nova solicitação de ${userData?.nome ?? 'usuário'}!`, 'success')
          })
          .subscribe()

        // Realtime: novos chamados SOS na cidade do prestador
        const channelSos = supabase
          .channel(`sos_${pData.cidade}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'service_requests',
          }, (payload) => {
            const req = payload.new as any
            if (
              req.provider_id === null &&
              req.assigned_provider_id === null &&
              pData.tipos_servico.includes(req.tipo_servico) &&
              req.cidade?.toLowerCase() === pData.cidade?.toLowerCase()
            ) {
              setSosRequests(prev => [req, ...prev])
              showToast(`🚨 Novo chamado SOS em ${req.cidade}!`, 'success')
            }
          })
          .subscribe()

        return () => {
          supabase.removeChannel(channelDirect)
          supabase.removeChannel(channelSos)
        }
      } else {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function fetchRequests(pid: string) {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('service_requests')
        .select(`
          id, user_id, provider_id, assigned_provider_id, tipo_servico, cidade, observacao, status, created_at, nome_cliente, telefone_cliente,
          user:profiles!service_requests_user_id_fkey(nome, email)
        `)
        .eq('provider_id', pid)
        .order('created_at', { ascending: false })

      setRequests((data ?? []) as unknown as RequestWithUser[])
    } finally {
      setLoading(false)
    }
  }

  async function fetchSosRequests(tipos: string[], cidade: string) {
    const { data } = await supabase
      .from('service_requests')
      .select('id, tipo_servico, cidade, observacao, status, created_at, nome_cliente, telefone_cliente, provider_id, assigned_provider_id, user_id')
      .is('provider_id', null)
      .is('assigned_provider_id', null)
      .eq('status', 'pendente')
      .in('tipo_servico', tipos)
      .ilike('cidade', cidade)
      .order('created_at', { ascending: false })

    setSosRequests((data ?? []) as unknown as RequestWithUser[])
  }

  async function aceitarSos(id: string) {
    if (!providerId) return
    setActionLoading(id)

    const { error } = await supabase
      .from('service_requests')
      .update({ assigned_provider_id: providerId, status: 'em_andamento' })
      .eq('id', id)
      .is('assigned_provider_id', null)

    if (error) {
      showToast('Chamado já foi aceito por outro prestador.', 'error')
    } else {
      setSosRequests(prev => prev.filter(r => r.id !== id))
      showToast('Chamado SOS aceito! Entre em contato com o cliente.', 'success')
    }
    setActionLoading(null)
  }

  async function updateStatus(id: string, status: string) {
    setActionLoading(id)
    const request = requests.find(r => r.id === id)
    const { error } = await supabase
      .from('service_requests')
      .update({ status })
      .eq('id', id)

    if (error) {
      showToast('Erro ao atualizar.', 'error')
    } else {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
      showToast(
        status === 'em_andamento' ? 'Atendimento iniciado!' : status === 'concluido' ? 'Atendimento concluído!' : 'Solicitação cancelada.',
        status === 'cancelado' ? 'error' : 'success'
      )

      if (status === 'concluido' && request?.user_id) {
        const { data: providerInfo } = await supabase
          .from('providers')
          .select('nome')
          .eq('id', request.provider_id)
          .single()

        await supabase.from('notifications').insert({
          user_id: request.user_id,
          titulo: 'Como foi o atendimento?',
          mensagem: `Seu atendimento com ${providerInfo?.nome ?? 'o prestador'} foi concluído. Que tal deixar uma avaliação?`,
          tipo: 'avaliacao',
          lida: false,
        })
      }
    }
    setActionLoading(null)
  }

  const totais = {
    pendente: requests.filter(r => r.status === 'pendente').length,
    em_andamento: requests.filter(r => r.status === 'em_andamento').length,
    concluido: requests.filter(r => r.status === 'concluido').length,
  }

  return (
    <ProviderLayout nomeUsuario={profile?.nome} activeTab="solicitacoes">
      {ToastComponent}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Solicitações</h1>
            <p className="text-gray-500 mt-1">Gerencie os pedidos de atendimento.</p>
          </div>
          {providerId && providerData && (
            <Button
              onClick={() => {
                fetchRequests(providerId)
                fetchSosRequests(providerData.tipos_servico, providerData.cidade)
              }}
              variant="ghost"
              size="sm"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          )}
        </div>

        {!isApproved && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Cadastro pendente de aprovação</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Quando aprovado, você começará a receber solicitações e chamados SOS.
              </p>
            </div>
          </div>
        )}

        {/* CHAMADOS SOS */}
        {isApproved && sosRequests.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Siren className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-red-600">Chamados SOS na sua cidade</h2>
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {sosRequests.length}
              </span>
            </div>
            <div className="space-y-3">
              {sosRequests.map(r => (
                <div key={r.id} className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-bold text-red-700 text-sm">🚨 {tipoLabel[r.tipo_servico] ?? r.tipo_servico}</p>
                      <p className="text-sm text-gray-600 mt-0.5">{r.cidade}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">{r.nome_cliente}</p>
                      <p className="text-xs text-gray-500">{r.telefone_cliente}</p>
                    </div>
                  </div>

                  {r.observacao && (
                    <div className="bg-white border border-red-100 rounded-xl px-4 py-3 mb-3">
                      <p className="text-sm text-gray-700">{r.observacao}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      loading={actionLoading === r.id}
                      onClick={() => aceitarSos(r.id)}
                      className="w-full !bg-red-500 hover:!bg-red-600 !text-white font-bold"
                    >
                      <Check className="w-4 h-4" />
                      Aceitar chamado SOS
                    </Button>
                    {r.telefone_cliente && (
                      <a
                        href={whatsappLink(r.telefone_cliente, `Olá ${r.nome_cliente ?? 'cliente'}, sou ${profile?.nome ?? 'prestador'} do Vrum SOS e vi seu chamado de ${tipoLabel[r.tipo_servico] ?? r.tipo_servico} em ${r.cidade}. Posso te ajudar! Pode me passar sua localização?`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chamar no WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumo solicitações diretas */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-amber-700">{totais.pendente}</p>
              <p className="text-xs text-amber-600 font-medium mt-0.5">Nova{totais.pendente !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-blue-700">{totais.em_andamento}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">Andamento</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-green-700">{totais.concluido}</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">Concluído{totais.concluido !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {loading ? (
          <PageSpinner />
        ) : requests.length === 0 && sosRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Nenhuma solicitação ainda</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {isApproved
                ? 'Quando usuários solicitarem seu atendimento ou enviarem chamados SOS, eles aparecerão aqui.'
                : 'Aguarde a aprovação do seu cadastro para começar a receber solicitações.'}
            </p>
          </div>
        ) : requests.length > 0 ? (
          <div>
            <h2 className="font-bold text-slate-800 mb-3">Solicitações diretas</h2>
            <div className="space-y-4">
              {requests.map(r => (
                <div
                  key={r.id}
                  className={`bg-white rounded-2xl border shadow-sm p-5 ${
                    r.status === 'pendente' ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-700 font-bold text-sm">
                          {(r.user?.nome ?? r.nome_cliente ?? '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.user?.nome ?? r.nome_cliente ?? 'Usuário'}</p>
                        <p className="text-xs text-gray-400">{r.user?.email ?? r.telefone_cliente ?? ''}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.created_at)}</p>
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Serviço</p>
                      <p className="text-sm font-semibold text-gray-800">{tipoLabel[r.tipo_servico] ?? r.tipo_servico}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 mb-0.5">Cidade</p>
                      <p className="text-sm font-semibold text-gray-800">{r.cidade}</p>
                    </div>
                  </div>

                  {r.observacao && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-4">
                      <p className="text-xs text-orange-600 font-medium mb-0.5">Observação</p>
                      <p className="text-sm text-gray-700">{r.observacao}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {r.status === 'pendente' && (
                      <>
                        <Button
                          size="sm"
                          loading={actionLoading === r.id}
                          onClick={() => updateStatus(r.id, 'em_andamento')}
                          className="!text-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Aceitar e iniciar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={actionLoading === r.id}
                          onClick={() => updateStatus(r.id, 'cancelado')}
                          className="text-red-500 hover:bg-red-50 !text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                          Recusar
                        </Button>
                      </>
                    )}
                    {r.status === 'em_andamento' && (
                      <Button
                        size="sm"
                        loading={actionLoading === r.id}
                        onClick={() => updateStatus(r.id, 'concluido')}
                        className="!text-xs bg-green-500 hover:bg-green-600"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Marcar como concluído
                      </Button>
                    )}
                    {r.telefone_cliente && (
                      <a
                        href={whatsappLink(r.telefone_cliente, `Olá ${r.user?.nome ?? r.nome_cliente ?? 'cliente'}, sou ${profile?.nome ?? 'prestador'} do Vrum SOS e recebi sua solicitação de ${tipoLabel[r.tipo_servico] ?? r.tipo_servico}. Vou entrar em contato para combinar o atendimento!`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </ProviderLayout>
  )
}
