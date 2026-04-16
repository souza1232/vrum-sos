import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/layout/AdminLayout'
import { Users, Wrench, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('nome')
    .eq('id', user!.id)
    .single()

  // Buscar métricas
  const [
    { count: totalUsers },
    { count: totalProviders },
    { count: pendentes },
    { count: aprovados },
    { count: reprovados },
    { count: totalRequests },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('tipo_usuario', 'user'),
    supabase.from('providers').select('*', { count: 'exact', head: true }),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status_aprovacao', 'pendente'),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status_aprovacao', 'aprovado'),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('status_aprovacao', 'reprovado'),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }),
  ])

  // Últimos prestadores pendentes
  const { data: recentPendentes } = await supabase
    .from('providers')
    .select('id, nome, cidade, estado, tipos_servico, created_at')
    .eq('status_aprovacao', 'pendente')
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Usuários cadastrados', value: totalUsers ?? 0, icon: Users, color: 'bg-blue-500', bg: 'bg-blue-50' },
    { label: 'Prestadores total', value: totalProviders ?? 0, icon: Wrench, color: 'bg-purple-500', bg: 'bg-purple-50' },
    { label: 'Aguardando aprovação', value: pendentes ?? 0, icon: Clock, color: 'bg-amber-500', bg: 'bg-amber-50' },
    { label: 'Aprovados', value: aprovados ?? 0, icon: CheckCircle, color: 'bg-green-500', bg: 'bg-green-50' },
    { label: 'Reprovados', value: reprovados ?? 0, icon: XCircle, color: 'bg-red-500', bg: 'bg-red-50' },
    { label: 'Solicitações', value: totalRequests ?? 0, icon: AlertCircle, color: 'bg-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <AdminLayout nomeUsuario={profile?.nome} activeTab="dashboard">
      <div className="space-y-8">
        {/* Saudação */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Painel Admin
          </h1>
          <p className="text-gray-500 mt-1">Visão geral da plataforma Vrum SOS.</p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Pendentes recentes */}
        {(pendentes ?? 0) > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Prestadores aguardando aprovação
              </h2>
              <a href="/admin/prestadores?status=pendente" className="text-sm text-orange-500 hover:text-orange-600 font-medium">
                Ver todos →
              </a>
            </div>
            <div className="divide-y divide-gray-100">
              {recentPendentes?.map(p => (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{p.nome}</p>
                    <p className="text-xs text-gray-500">{p.cidade}, {p.estado}</p>
                  </div>
                  <div className="hidden sm:flex flex-wrap gap-1">
                    {(p.tipos_servico as string[]).slice(0, 2).map(t => (
                      <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  <a
                    href="/admin/prestadores"
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600 whitespace-nowrap"
                  >
                    Revisar →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
