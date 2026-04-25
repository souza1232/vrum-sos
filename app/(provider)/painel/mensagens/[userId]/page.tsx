'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ProviderLayout from '@/components/layout/ProviderLayout'
import ChatWindow from '@/components/ui/ChatWindow'
import { PageSpinner } from '@/components/ui/Spinner'
import { ChevronLeft } from 'lucide-react'

export default function ProviderChatPage() {
  const supabase = createClient()
  const params = useParams()
  const userId = params.userId as string
  const [profile, setProfile] = useState<{ id: string; nome: string } | null>(null)
  const [providerId, setProviderId] = useState<string | null>(null)
  const [otherUser, setOtherUser] = useState<{ id: string; nome: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data: providerData }, { data: otherData }] = await Promise.all([
        supabase.from('profiles').select('id, nome').eq('id', user.id).single(),
        supabase.from('providers').select('id').eq('profile_id', user.id).single(),
        supabase.from('profiles').select('id, nome').eq('id', userId).single(),
      ])

      setProfile(profileData as any)
      setProviderId(providerData?.id ?? null)
      setOtherUser(otherData as any)
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) return (
    <ProviderLayout activeTab="mensagens">
      <PageSpinner />
    </ProviderLayout>
  )

  return (
    <ProviderLayout nomeUsuario={profile?.nome} activeTab="mensagens">
      <div className="space-y-4">
        <Link href="/painel/mensagens" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Voltar para mensagens
        </Link>

        {profile && providerId && otherUser ? (
          <ChatWindow
            currentUserId={profile.id}
            otherUserId={otherUser.id}
            providerId={providerId}
            otherUserName={otherUser.nome}
          />
        ) : (
          <p className="text-gray-500 text-sm">Usuário não encontrado.</p>
        )}
      </div>
    </ProviderLayout>
  )
}
