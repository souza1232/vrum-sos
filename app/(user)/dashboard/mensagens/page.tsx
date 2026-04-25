'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import UserLayout from '@/components/layout/UserLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { MessageSquare, ChevronRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Conversation {
  provider_id: string
  provider_nome: string
  last_message: string
  last_at: string
  unread: number
}

export default function UserMensagensPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<{ id: string; nome: string; tipo_usuario: 'user' | 'provider' | 'admin' } | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nome, tipo_usuario')
        .eq('id', user.id)
        .single()

      setProfile(profileData as any)

      // Buscar todas as mensagens do usuário agrupadas por provider
      const { data: msgs } = await supabase
        .from('messages')
        .select('provider_id, content, created_at, read_at, sender_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (!msgs) { setLoading(false); return }

      // Agrupar por provider_id
      const map: Record<string, { last_message: string; last_at: string; unread: number }> = {}
      msgs.forEach(m => {
        if (!map[m.provider_id]) {
          map[m.provider_id] = {
            last_message: m.content,
            last_at: m.created_at,
            unread: 0,
          }
        }
        if (m.sender_id !== user.id && !m.read_at) {
          map[m.provider_id].unread += 1
        }
      })

      // Buscar nomes dos providers
      const providerIds = Object.keys(map)
      if (providerIds.length === 0) { setLoading(false); return }

      const { data: providers } = await supabase
        .from('providers')
        .select('id, nome')
        .in('id', providerIds)

      const convs: Conversation[] = providerIds.map(pid => ({
        provider_id: pid,
        provider_nome: providers?.find(p => p.id === pid)?.nome ?? 'Prestador',
        ...map[pid],
      }))

      setConversations(convs)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome} activeTab="mensagens">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mensagens</h1>
          <p className="text-gray-500 mt-1">Suas conversas com prestadores.</p>
        </div>

        {loading ? (
          <PageSpinner />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Nenhuma conversa ainda</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Acesse o perfil de um prestador e clique em "Enviar mensagem" para iniciar.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map(conv => (
              <Link
                key={conv.provider_id}
                href={`/dashboard/mensagens/${conv.provider_id}`}
                className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-4 hover:border-orange-200 hover:bg-orange-50 transition-colors"
              >
                <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-bold">{conv.provider_nome.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm truncate">{conv.provider_nome}</p>
                    <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(conv.last_at)}</p>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{conv.last_message}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  )
}
