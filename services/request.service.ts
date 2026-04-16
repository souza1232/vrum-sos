import { createClient } from '@/lib/supabase/client'
import { ServiceRequest, ServiceRequestForm, StatusSolicitacao } from '@/types'

const supabase = createClient()

export async function createServiceRequest(
  userId: string,
  form: ServiceRequestForm
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('service_requests').insert({
    user_id: userId,
    provider_id: form.provider_id,
    tipo_servico: form.tipo_servico,
    cidade: form.cidade,
    observacao: form.observacao ?? null,
    status: 'pendente',
  })

  return { error: error?.message ?? null }
}

export async function fetchUserRequests(userId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, provider:providers(nome, cidade, whatsapp)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ServiceRequest[]
}

export async function fetchProviderRequests(providerId: string): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, user:profiles(nome, email)')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ServiceRequest[]
}

export async function updateRequestStatus(
  id: string,
  status: StatusSolicitacao
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('service_requests')
    .update({ status })
    .eq('id', id)

  return { error: error?.message ?? null }
}

export async function fetchAllRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select('*, provider:providers(nome), user:profiles(nome)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ServiceRequest[]
}
