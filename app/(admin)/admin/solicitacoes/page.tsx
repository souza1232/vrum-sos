'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/layout/AdminLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { FileText, Search, RefreshCw } from 'lucide-react'

interface RequestWithRelations {
  id: string
  tipo_servico: string
  cidade: string
  observacao: string | null
  status: string
  created_at: string
  user: { nome: string; email: string } | null
  provider: { nome: string; cidade: string } | null
}

const STATUS_OPTS = [
  { value: '', label: 'Todos' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

const STATUS_NEXT: Record<string, string> = {
  pendente: 'em_andamento',
  em_andamento: 'concluido',
}

export default function AdminSolicitacoesPage() {
  const supabase = createClient()
  const [requests, setRequests] = useState<RequestWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [adminProfile, setAdminProfile] = useState<{ nome: string } | null>(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [busca, setBusca] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
        setAdminProfile(data as any)
      }
      await fetchRequests()
    }
    init()
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [filterStatus])

  async function fetchRequests() {
    setLoading(true)
    try {
      let query = supabase
        .from('service_requests')
        .select(`
          id, tipo_servico, cidade, observacao, status, created_at,
          user:profiles!service_requests_user_id_fkey(nome, email),
          provider:providers!service_requests_provider_id_fkey(nome, cidade)
        `)
        .order('created_at', { ascending: false })

      if (filterStatus) query = query.eq('status', filterStatus)

      const { data } = await query
      let result = (data ?? []) as unknown as RequestWithRelations[]

      if (busca) {
        const b = busca.toLowerCase()
        result = result.filter(r =>
          r.user?.nome.toLowerCase().includes(b) ||
          r.provider?.nome.toLowerCase().includes(b) ||
          r.cidade.toLowerCase().includes(b)
        )
      }

      setRequests(result)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', id)

      if (error) {
        showToast('Erro ao atualizar status.', 'error')
      } else {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
        showToast('Status atualizado!', 'success')
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function cancelRequest(id: string) {
    if (!confirm('Cancelar esta solicitação?')) return
    await updateStatus(id, 'cancelado')
  }

  const tipoLabel: Record<string, string> = {
    mecanico: 'Mecânico',
    eletricista: 'Eletricista',
    chaveiro: 'Chaveiro',
    borracheiro: 'Borracheiro',
    guincho: 'Guincho',
    guincho_pesado: 'Guincho Pesado',
  }

  return (
    <AdminLayout nomeUsuario={adminProfile?.nome} activeTab="requests">
      {ToastComponent}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Solicitações</h1>
            <p className="text-gray-500 text-sm">{requests.length} encontrada(s)</p>
          </div>
          <Button onClick={fetchRequests} variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRequests()}
              placeholder="Buscar por usuário, prestador ou cidade..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            {STATUS_OPTS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Button onClick={fetchRequests} size="sm">
            <Search className="w-4 h-4" />
            Filtrar
          </Button>
        </div>

        {/* Lista */}
        {loading ? (
          <PageSpinner />
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Nenhuma solicitação encontrada.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Prestador</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Serviço</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cidade</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900">{r.user?.nome ?? '—'}</p>
                        <p className="text-xs text-gray-400">{r.user?.email ?? ''}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900">{r.provider?.nome ?? '—'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                          {tipoLabel[r.tipo_servico] ?? r.tipo_servico}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{r.cidade}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {STATUS_NEXT[r.status] && (
                            <Button
                              size="sm"
                              variant="outline"
                              loading={actionLoading === r.id}
                              onClick={() => updateStatus(r.id, STATUS_NEXT[r.status])}
                              className="!py-1 !px-2 !text-xs"
                            >
                              Avançar
                            </Button>
                          )}
                          {r.status !== 'cancelado' && r.status !== 'concluido' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelRequest(r.id)}
                              className="!py-1 !px-2 !text-xs text-red-500 hover:bg-red-50"
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
