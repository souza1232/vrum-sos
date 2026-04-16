'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile, TipoUsuario } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatDate } from '@/lib/utils'
import { Search, User, Wrench, ShieldCheck, Trash2 } from 'lucide-react'

export default function AdminUsuariosPage() {
  const supabase = createClient()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [adminProfile, setAdminProfile] = useState<{ nome: string } | null>(null)
  const [filterTipo, setFilterTipo] = useState<TipoUsuario | ''>('')
  const [busca, setBusca] = useState('')
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
        setAdminProfile(data as any)
      }
      await fetchUsers()
    }
    init()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false })
      if (filterTipo) query = query.eq('tipo_usuario', filterTipo)
      if (busca) query = query.ilike('nome', `%${busca}%`)
      const { data } = await query
      if (data) setProfiles(data as Profile[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [filterTipo])

  async function deleteProfile(id: string, nome: string) {
    if (!confirm(`Excluir usuário "${nome}"? Esta ação não pode ser desfeita.`)) return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) {
      showToast('Erro ao excluir usuário.', 'error')
    } else {
      setProfiles(prev => prev.filter(p => p.id !== id))
      showToast('Usuário excluído.', 'success')
    }
  }

  const tipoConfig: Record<TipoUsuario, { label: string; icon: React.ReactNode; variant: 'info' | 'default' | 'success' }> = {
    user: { label: 'Usuário', icon: <User className="w-3.5 h-3.5" />, variant: 'info' },
    provider: { label: 'Prestador', icon: <Wrench className="w-3.5 h-3.5" />, variant: 'default' },
    admin: { label: 'Admin', icon: <ShieldCheck className="w-3.5 h-3.5" />, variant: 'success' },
  }

  return (
    <AdminLayout nomeUsuario={adminProfile?.nome} activeTab="users">
      {ToastComponent}

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Usuários</h1>
            <p className="text-gray-500 text-sm">{profiles.length} cadastrado(s)</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUsers()}
              placeholder="Buscar por nome..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value as TipoUsuario | '')}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="">Todos os tipos</option>
            <option value="user">Usuários</option>
            <option value="provider">Prestadores</option>
            <option value="admin">Admins</option>
          </select>
          <Button onClick={fetchUsers} size="sm">
            <Search className="w-4 h-4" />
            Buscar
          </Button>
        </div>

        {/* Tabela */}
        {loading ? (
          <PageSpinner />
        ) : profiles.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p>Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">E-mail</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cadastrado em</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {profiles.map(p => {
                    const tipo = tipoConfig[p.tipo_usuario]
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {p.nome.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{p.nome}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">{p.email}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={tipo.variant} size="sm">
                            <span className="flex items-center gap-1">
                              {tipo.icon}
                              {tipo.label}
                            </span>
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500">{formatDate(p.created_at)}</td>
                        <td className="px-5 py-3.5">
                          {p.tipo_usuario !== 'admin' && (
                            <button
                              onClick={() => deleteProfile(p.id, p.nome)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
