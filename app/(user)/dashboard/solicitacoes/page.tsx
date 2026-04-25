'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import UserLayout from '@/components/layout/UserLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { FileText, X, RefreshCw, MessageCircle } from 'lucide-react'
import { whatsappLink } from '@/lib/utils'

interface RequestWithProvider {
  id: string
  tipo_servico: string
  cidade: string
  observacao: string | null
  status: string
  created_at: string
  provider: {
    id: string
    nome: string
    cidade: string
    whatsapp: string | null
  } | null
}

const tipoLabel: Record<string, string> = {
  mecanico: 'Mecânico',
  eletricista: 'Eletricista Automotivo',
  chaveiro: 'Chaveiro',
  borracheiro: 'Borracheiro',
  guincho: 'Guincho',
  guincho_pesado: 'Guincho Pesado',
}

export default function UserSolicitacoesPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<RequestWithProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ nome: string; tipo_usuario: 'user' | 'provider' | 'admin'; id: string } | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('nome, tipo_usuario, id')
        .eq('id', user.id)
        .single()

      setProfile(profileData as any)
      if (profileData) await fetchRequests(user.id)
    }
    load()
  }, [])

  async function fetchRequests(userId: string) {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('service_requests')
        .select(`
          id, tipo_servico, cidade, observacao, status, created_at,
          provider:providers!service_requests_provider_id_fkey(id, nome, cidade, whatsapp)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      setRequests((data ?? []) as unknown as RequestWithProvider[])
    } finally {
      setLoading(false)
    }
  }

  async function cancelRequest(id: string) {
    if (!confirm('Cancelar esta solicitação?')) return
    setActionLoading(id)
    const { error } = await supabase
      .from('service_requests')
      .update({ status: 'cancelado' })
      .eq('id', id)

    if (error) {
      showToast('Erro ao cancelar.', 'error')
    } else {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelado' } : r))
      showToast('Solicitação cancelada.', 'success')
    }
    setActionLoading(null)
  }

  const totais = {
    pendente: requests.filter(r => r.status === 'pendente').length,
    em_andamento: requests.filter(r => r.status === 'em_andamento').length,
    concluido: requests.filter(r => r.status === 'concluido').length,
  }

  return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome} activeTab="solicitacoes">
      {ToastComponent}

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Minhas Solicitações</h1>
          <p className="text-gray-500 mt-1">Acompanhe os atendimentos que você solicitou.</p>
        </div>

        {/* Cards de resumo */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-amber-700">{totais.pendente}</p>
              <p className="text-xs text-amber-600 font-medium mt-0.5 leading-tight">Pendente{totais.pendente !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 text-center">
              <p className="text-xl sm:text-2xl font-black text-blue-700">{totais.em_andamento}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5 leading-tight">Em andamento</p>
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
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Encontre um prestador e solicite seu primeiro atendimento.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Buscar prestadores
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {r.provider?.nome ?? 'Prestador não encontrado'}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.created_at)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-gray-400">Serviço</p>
                    <p className="text-sm font-medium text-gray-700">{tipoLabel[r.tipo_servico] ?? r.tipo_servico}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Cidade</p>
                    <p className="text-sm font-medium text-gray-700">{r.cidade}</p>
                  </div>
                  {r.provider?.cidade && (
                    <div>
                      <p className="text-xs text-gray-400">Cidade do prestador</p>
                      <p className="text-sm font-medium text-gray-700">{r.provider.cidade}</p>
                    </div>
                  )}
                </div>

                {r.observacao && (
                  <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-gray-400 mb-0.5">Observação</p>
                    <p className="text-sm text-gray-700">{r.observacao}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {r.provider?.whatsapp && (
                    <a
                      href={whatsappLink(r.provider.whatsapp, `Olá ${r.provider.nome}, estou verificando minha solicitação no Vrum SOS.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  )}
                  {r.status === 'pendente' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={actionLoading === r.id}
                      onClick={() => cancelRequest(r.id)}
                      className="text-red-500 hover:bg-red-50 !text-xs !py-2 !px-3"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  )
}
