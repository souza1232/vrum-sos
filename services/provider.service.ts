import { createClient } from '@/lib/supabase/client'
import { Provider, ProviderFilters, StatusAprovacao } from '@/types'

const supabase = createClient()

export async function fetchApprovedProviders(filters: ProviderFilters = {}): Promise<Provider[]> {
  let query = supabase
    .from('providers')
    .select('*')
    .eq('status_aprovacao', 'aprovado')
    .eq('ativo', true)
    .order('created_at', { ascending: false })

  if (filters.cidade) {
    query = query.ilike('cidade', `%${filters.cidade}%`)
  }
  if (filters.tipo_servico) {
    query = query.contains('tipos_servico', [filters.tipo_servico])
  }
  if (filters.busca) {
    query = query.ilike('nome', `%${filters.busca}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Provider[]
}

export async function fetchProviderById(id: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('id', id)
    .eq('status_aprovacao', 'aprovado')
    .single()

  if (error) return null
  return data as Provider
}

export async function fetchProviderByProfileId(profileId: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('profile_id', profileId)
    .single()

  if (error) return null
  return data as Provider
}

export async function updateProviderData(
  id: string,
  updates: Partial<Provider>
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('providers')
    .update(updates)
    .eq('id', id)

  return { error: error?.message ?? null }
}

export async function updateProviderStatus(
  id: string,
  status: StatusAprovacao
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('providers')
    .update({ status_aprovacao: status })
    .eq('id', id)

  return { error: error?.message ?? null }
}

export async function deleteProvider(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('providers')
    .delete()
    .eq('id', id)

  return { error: error?.message ?? null }
}

export async function fetchAllProviders(filters: {
  status?: StatusAprovacao | ''
  cidade?: string
  busca?: string
} = {}): Promise<Provider[]> {
  let query = supabase
    .from('providers')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status_aprovacao', filters.status)
  if (filters.cidade) query = query.ilike('cidade', `%${filters.cidade}%`)
  if (filters.busca) query = query.ilike('nome', `%${filters.busca}%`)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Provider[]
}
