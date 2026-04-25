import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Se vier com next específico (ex: reset-password), redireciona direto
      if (next !== '/') {
        return NextResponse.redirect(`${origin}${next}`)
      }

      // Buscar tipo de usuário pra redirecionar pro lugar certo
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('tipo_usuario')
          .eq('id', user.id)
          .single()

        const tipo = profile?.tipo_usuario ?? 'user'

        if (tipo === 'admin') return NextResponse.redirect(`${origin}/admin`)
        if (tipo === 'provider') return NextResponse.redirect(`${origin}/painel`)
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      return NextResponse.redirect(`${origin}/`)
    }
  }

  return NextResponse.redirect(`${origin}/login?erro=link_invalido`)
}
