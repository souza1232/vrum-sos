'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AdminLayout from '@/components/layout/AdminLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { Flag, Check, Trash2, AlertTriangle, UserX } from 'lucide-react'

interface Report {
  id: string
  motivo: string
  descricao: string | null
  status: string
  created_at: string
  provider_id: string
  provider_nome: string
  user_nome: string
}

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-700',
  analisado: 'bg-blue-100 text-blue-700',
  resolvido: 'bg-green-100 text-green-700',
}

export default function AdminDenunciasPage() {
  const supabase = createClient()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ nome: string } | null>(null)
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
        setProfile(data as any)
      }
      await fetchReports()
    }
    load()
  }, [])

  async function fetchReports() {
    setLoading(true)
    try {
      const { data: reportsData } = await supabase
        .from('reports')
        .select('id, motivo, descricao, status, created_at, provider_id, user_id')
        .order('created_at', { ascending: false })

      if (!reportsData) return

      const providerIds = Array.from(new Set(reportsData.map(r => r.provider_id)))
      const userIds = Array.from(new Set(reportsData.map(r => r.user_id)))

      const [{ data: providers }, { data: users }] = await Promise.all([
        supabase.from('providers').select('id, nome').in('id', providerIds),
        supabase.from('profiles').select('id, nome').in('id', userIds),
      ])

      const enriched: Report[] = reportsData.map(r => ({
        ...r,
        provider_nome: providers?.find(p => p.id === r.provider_id)?.nome ?? 'Desconhecido',
        user_nome: users?.find(u => u.id === r.user_id)?.nome ?? 'Usuário',
      }))

      setReports(enriched)
    } finally {
      setLoading(false)
    }
  }

  async function marcarAnalisado(id: string) {
    setActionLoading(id)
    await supabase.from('reports').update({ status: 'analisado' }).eq('id', id)
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'analisado' } : r))
    setActionLoading(null)
    showToast('Marcado como analisado.', 'success')
  }

  async function desativarPrestador(providerId: string, reportId: string) {
    if (!confirm('Desativar este prestador? Ele ficará invisível na busca.')) return
    setActionLoading(reportId)

    await Promise.all([
      supabase.from('providers').update({ status_aprovacao: 'reprovado' }).eq('id', providerId),
      supabase.from('reports').update({ status: 'resolvido' }).eq('id', reportId),
    ])

    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolvido' } : r))
    setActionLoading(null)
    showToast('Prestador desativado e denúncia resolvida.', 'success')
  }

  async function deletarReport(id: string) {
    setActionLoading(id)
    await supabase.from('reports').delete().eq('id', id)
    setReports(prev => prev.filter(r => r.id !== id))
    setActionLoading(null)
    showToast('Denúncia removida.', 'success')
  }

  const pendentes = reports.filter(r => r.status === 'pendente').length

  return (
    <AdminLayout nomeUsuario={profile?.nome} activeTab="denuncias">
      {ToastComponent}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Denúncias
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {reports.length} denúncia(s) · {pendentes} pendente(s)
            </p>
          </div>
        </div>

        {loading ? (
          <PageSpinner />
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Nenhuma denúncia</h3>
            <p className="text-sm text-gray-500">Tudo certo por aqui!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div
                key={r.id}
                className={`bg-white rounded-xl border shadow-sm p-5 ${
                  r.status === 'pendente' ? 'border-red-200 ring-1 ring-red-100' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {r.provider_nome}
                        <span className="text-gray-400 font-normal"> · denunciado por </span>
                        {r.user_nome}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.created_at)}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </span>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                  <p className="text-xs text-red-500 font-medium mb-0.5">Motivo</p>
                  <p className="text-sm text-gray-800 font-medium">{r.motivo}</p>
                  {r.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{r.descricao}</p>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {r.status === 'pendente' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={actionLoading === r.id}
                      onClick={() => marcarAnalisado(r.id)}
                      className="!text-xs border border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Marcar como analisado
                    </Button>
                  )}
                  {r.status !== 'resolvido' && (
                    <Button
                      size="sm"
                      variant="danger"
                      loading={actionLoading === r.id}
                      onClick={() => desativarPrestador(r.provider_id, r.id)}
                      className="!text-xs"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      Desativar prestador
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={actionLoading === r.id}
                    onClick={() => deletarReport(r.id)}
                    className="!text-xs text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
