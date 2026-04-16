import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Rotas protegidas que requerem autenticação
  const protectedRoutes = ['/dashboard', '/painel', '/admin']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  // Rotas de auth (não devem ser acessadas quando logado)
  const authRoutes = ['/login', '/register', '/provider-login', '/provider-register']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    // Buscar tipo_usuario do perfil
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    const tipo = profile?.tipo_usuario ?? 'user'
    const url = request.nextUrl.clone()

    if (tipo === 'admin') {
      url.pathname = '/admin'
    } else if (tipo === 'provider') {
      url.pathname = '/painel'
    } else {
      url.pathname = '/dashboard'
    }

    return NextResponse.redirect(url)
  }

  // Proteger área admin
  if (pathname.startsWith('/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    if (profile?.tipo_usuario !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Proteger área do prestador
  if (pathname.startsWith('/painel') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    if (profile?.tipo_usuario !== 'provider' && profile?.tipo_usuario !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
