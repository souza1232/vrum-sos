'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Provider, StatusAprovacao, TIPOS_SERVICO_LABELS, TipoServico } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import {
  Check, X, Trash2, Search, Filter, MapPin,
  Building2, User, Phone, MessageCircle, ChevronDown, ChevronUp
} from 'lucide-react'

export default function AdminPrestadoresPage() {
  const supabase = createClient()
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ nome: string } | null>(null)
  const [filterStatus, setFilterStatus] = useState<StatusAprovacao | ''>('')
  const [filterCidade, setFilterCidade] = useState('')
  const [filterBusca, setFilterBusca] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
        setProfile(data as any)
      }
      await fetchProviders()
    }
    init()
  }, [])

  async function fetchProviders() {
    setLoading(true)
    try {
      let query = supabase.from('providers').select('*').order('created_at', { ascending: false })

      if (filterStatus) query = query.eq('status_aprovacao', filterStatus)
      if (filterCidade) query = query.ilike('cidade', `%${filterCidade}%`)
      if (filterBusca) query = query.ilike('nome', `%${filterBusca}%`)

      const { data } = await query
      if (data) setProviders(data as Provider[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [filterStatus])

  async function updateStatus(id: string, status: StatusAprovacao) {
    setActionLoading(id)
    try {
      const { error } = await supabase
        .from('providers')
        .update({ status_aprovacao: status })
        .eq('id', id)

      if (error) {
        showToast('Erro ao atualizar status.', 'error')
      } else {
        setProviders(prev =>
          prev.map(p => p.id === id ? { ...p, status_aprovacao: status } : p)
        )
        showToast(
          status === 'aprovado' ? 'Prestador aprovado!' : 'Prestador reprovado.',
          status === 'aprovado' ? 'success' : 'error'
        )
      }
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteProvider(id: string) {
    if (!confirm('Tem certeza que deseja excluir este prestador? Esta ação não pode ser desfeita.')) return
    setActionLoading(id)
    try {
      const { error } = await supabase.from('providers').delete().eq('id', id)
      if (error) {
        showToast('Erro ao excluir.', 'error')
      } else {
        setProviders(prev => prev.filter(p => p.id !== id))
        showToast('Prestador excluído.', 'success')
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <AdminLayout nomeUsuario={profile?.nome} activeTab="providers">
      {ToastComponent}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Prestadores</h1>
            <p className="text-gray-500 text-sm">{providers.length} encontrado(s)</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filterBusca}
                onChange={e => setFilterBusca(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchProviders()}
                placeholder="Buscar por nome..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="relative flex-1 min-w-[150px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filterCidade}
                onChange={e => setFilterCidade(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchProviders()}
                placeholder="Filtrar cidade..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as StatusAprovacao | '')}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendentes</option>
              <option value="aprovado">Aprovados</option>
              <option value="reprovado">Reprovados</option>
            </select>
            <Button onClick={fetchProviders} size="sm">
              <Filter className="w-4 h-4" />
              Filtrar
            </Button>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <PageSpinner />
        ) : providers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Nenhum prestador encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {providers.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Linha principal */}
                <div className="px-5 py-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{p.nome.charAt(0).toUpperCase()}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{p.nome}</span>
                      <StatusBadge status={p.status_aprovacao} />
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        {p.tipo_prestador === 'empresa' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {p.tipo_prestador === 'empresa' ? 'Empresa' : 'Autônomo'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.cidade}, {p.estado} · {formatDate(p.created_at)}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.tipos_servico.slice(0, 3).map(t => (
                        <span key={t} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          {TIPOS_SERVICO_LABELS[t as TipoServico] ?? t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.status_aprovacao !== 'aprovado' && (
                      <Button
                        size="sm"
                        variant="primary"
                        loading={actionLoading === p.id}
                        onClick={() => updateStatus(p.id, 'aprovado')}
                        className="!py-1.5 !px-3 !text-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Aprovar
                      </Button>
                    )}
                    {p.status_aprovacao !== 'reprovado' && (
                      <Button
                        size="sm"
                        variant="danger"
                        loading={actionLoading === p.id}
                        onClick={() => updateStatus(p.id, 'reprovado')}
                        className="!py-1.5 !px-3 !text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reprovar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteProvider(p.id)}
                      className="!py-1.5 !px-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <button
                      onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      {expandedId === p.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {expandedId === p.id && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <Detail label="E-mail" value={p.email} />
                    <Detail label="Telefone" value={p.telefone ?? '—'} />
                    <Detail label="WhatsApp" value={p.whatsapp ?? '—'} />
                    <Detail label="Raio" value={`${p.raio_km}km`} />
                    <Detail label="Atende 24h" value={p.atende_24h ? 'Sim' : 'Não'} />
                    <Detail label="Fins de semana" value={p.atende_finais_semana ? 'Sim' : 'Não'} />
                    <Detail label="Emergencial" value={p.atendimento_emergencial ? 'Sim' : 'Não'} />
                    {p.cnpj && <Detail label="CNPJ" value={p.cnpj} />}
                    {p.descricao && (
                      <div className="col-span-2 md:col-span-4">
                        <p className="text-xs text-gray-400 mb-0.5">Descrição</p>
                        <p className="text-gray-700">{p.descricao}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-700 font-medium text-sm">{value}</p>
    </div>
  )
}
