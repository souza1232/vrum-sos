import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

webpush.setVapidDetails(
  'mailto:gzussouza@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: NextRequest) {
  const { tipoServico, cidade, title, body } = await req.json()
  if (!tipoServico || !cidade) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const supabase = createClient()

  // Busca prestadores aprovados com esse serviço nessa cidade
  const { data: providers } = await supabase
    .from('providers')
    .select('id')
    .eq('status_aprovacao', 'aprovado')
    .eq('ativo', true)
    .ilike('cidade', cidade)
    .contains('tipos_servico', [tipoServico])

  if (!providers?.length) return NextResponse.json({ ok: true, sent: 0 })

  const providerIds = providers.map(p => p.id)

  // Busca subscriptions desses prestadores
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .in('provider_id', providerIds)

  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 })

  const payload = JSON.stringify({
    title: title || '🚨 Novo chamado SOS!',
    body: body || `Chamado de ${tipoServico} em ${cidade}`,
    url: '/painel/solicitacoes',
  })

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ ok: true, sent })
}
