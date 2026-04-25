'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProviderLayout from '@/components/layout/ProviderLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { FileText, Check, X, RefreshCw, AlertCircle } from 'lucide-react'

interface RequestWithUser {
  id: string
  tipo_servico: string
  cidade: string
  observacao: string | null
  status: string
  created_at: string
  user_id: string
  provider_id: string
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
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ nome: string } | null>(null)
  const [providerId, setProviderId] = useState<string | null>(null)
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

      const { data: providerData } = await supabase
        .from('providers')
        .select('id, status_aprovacao')
        .eq('profile_id', user.id)
        .single()

      if (providerData) {
        setProviderId(providerData.id)
        setIsApproved(providerData.status_aprovacao === 'aprovado')
        await fetchRequests(providerData.id)

        // Realtime: escuta novas solicitações para este prestador
        const channel = supabase
          .channel(`solicitacoes_${providerData.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'service_requests',
              filter: `provider_id=eq.${providerData.id}`,
            },
            async (payload) => {
              // Busca o nome do usuário da nova solicitação
              const { data: userData } = await supabase
                .from('profiles')
                .select('nome, email')
                .eq('id', payload.new.user_id)
                .single()

              const nova: RequestWithUser = {
                ...(payload.new as any),
                user: userData ?? null,
              }

              setRequests(prev => [nova, ...prev])
              showToast(`Nova solicitação de ${userData?.nome ?? 'usuário'}!`, 'success')
            }
          )
          .subscribe()

        return () => { supabase.removeChannel(channel) }
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
          id, user_id, provider_id, tipo_servico, cidade, observacao, status, created_at,
          user:profiles!service_requests_user_id_fkey(nome, email)
        `)
        .eq('provider_id', pid)
        .order('created_at', { ascending: false })

      setRequests((data ?? []) as unknown as RequestWithUser[])
    } finally {
      setLoading(false)
    }
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

      // Lembrete de avaliação: notificar usuário quando atendimento for concluído
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
            <h1 className="text-2xl font-bold text-slate-900">Solicitações Recebidas</h1>
            <p className="text-gray-500 mt-1">Gerencie os pedidos de atendimento dos usuários.</p>
          </div>
          {providerId && (
            <Button onClick={() => fetchRequests(providerId)} variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          )}
        </div>

        {/* Aviso se não aprovado */}
        {!isApproved && !loading && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Cadastro pendente de aprovação</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Quando seu cadastro for aprovado, os usuários poderão encontrar você e enviar solicitações.
              </p>
            </div>
          </div>
        )}

        {/* Resumo */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-amber-700">{totais.pendente}</p>
              <p className="text-xs text-amber-600 font-medium mt-0.5 leading-tight">Nova{totais.pendente !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-blue-700">{totais.em_andamento}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5 leading-tight">Andamento</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-green-700">{totais.concluido}</p>
              <p className="text-xs text-green-600 font-medium mt-0.5 leading-tight">Concluído{totais.concluido !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {loading ? (
          <PageSpinner />
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Nenhuma solicitação ainda</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {isApproved
                ? 'Quando usuários solicitarem seu atendimento, eles aparecerão aqui.'
                : 'Aguarde a aprovação do seu cadastro para começar a receber solicitações.'}
            </p>
          </div>
        ) : (
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
                        {(r.user?.nome ?? '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{r.user?.nome ?? 'Usuário'}</p>
                      <p className="text-xs text-gray-400">{r.user?.email ?? ''}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.created_at)}</p>
                    </div>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Serviço solicitado</p>
                    <p className="text-sm font-semibold text-gray-800">{tipoLabel[r.tipo_servico] ?? r.tipo_servico}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">Cidade</p>
                    <p className="text-sm font-semibold text-gray-800">{r.cidade}</p>
                  </div>
                </div>

                {r.observacao && (
                  <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-orange-600 font-medium mb-0.5">Observação do usuário</p>
                    <p className="text-sm text-gray-700">{r.observacao}</p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2">
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
                      variant="primary"
                      loading={actionLoading === r.id}
                      onClick={() => updateStatus(r.id, 'concluido')}
                      className="!text-xs bg-green-500 hover:bg-green-600"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Marcar como concluído
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProviderLayout>
  )
}
