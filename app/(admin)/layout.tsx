import { ReactNode } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminRouteLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('tipo_usuario')
    .eq('id', user.id)
    .single()

  if (profile?.tipo_usuario !== 'admin') redirect('/dashboard')

  return <>{children}</>
}
