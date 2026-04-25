'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import UserLayout from '@/components/layout/UserLayout'
import ChatWindow from '@/components/ui/ChatWindow'
import { PageSpinner } from '@/components/ui/Spinner'
import { ChevronLeft } from 'lucide-react'

export default function UserChatPage() {
  const supabase = createClient()
  const params = useParams()
  const providerId = params.providerId as string
  const [profile, setProfile] = useState<{ id: string; nome: string; tipo_usuario: 'user' | 'provider' | 'admin' } | null>(null)
  const [provider, setProvider] = useState<{ id: string; nome: string; profile_id: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data: providerData }] = await Promise.all([
        supabase.from('profiles').select('id, nome, tipo_usuario').eq('id', user.id).single(),
        supabase.from('providers').select('id, nome, profile_id').eq('id', providerId).single(),
      ])

      setProfile(profileData as any)
      setProvider(providerData as any)
      setLoading(false)
    }
    load()
  }, [providerId])

  if (loading) return (
    <UserLayout activeTab="mensagens">
      <PageSpinner />
    </UserLayout>
  )

  return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome} activeTab="mensagens">
      <div className="space-y-4">
        <Link href="/dashboard/mensagens" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Voltar para mensagens
        </Link>

        {profile && provider ? (
          <ChatWindow
            currentUserId={profile.id}
            otherUserId={provider.profile_id}
            providerId={provider.id}
            otherUserName={provider.nome}
          />
        ) : (
          <p className="text-gray-500 text-sm">Prestador não encontrado.</p>
        )}
      </div>
    </UserLayout>
  )
}
