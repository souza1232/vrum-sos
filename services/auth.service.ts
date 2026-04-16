import { createClient } from '@/lib/supabase/client'
import { Profile, TipoUsuario } from '@/types'

const supabase = createClient()

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data as Profile
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signUp(
  email: string,
  password: string,
  nome: string,
  tipoUsuario: TipoUsuario = 'user'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, tipo_usuario: tipoUsuario },
    },
  })
  return { data, error }
}

export async function signOut() {
  return supabase.auth.signOut()
}

export function getDashboardRedirect(tipoUsuario: TipoUsuario): string {
  if (tipoUsuario === 'admin') return '/admin'
  if (tipoUsuario === 'provider') return '/painel'
  return '/dashboard'
}
