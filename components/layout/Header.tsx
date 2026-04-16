'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Zap, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from '@/components/notifications/NotificationBell'

interface HeaderProps {
  tipoUsuario?: 'user' | 'provider' | 'admin' | null
  nomeUsuario?: string | null
  userId?: string | null
}

export default function Header({ tipoUsuario, nomeUsuario, userId }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(userId ?? null)
  const router = useRouter()
  const supabase = createClient()

  // Resolver userId se não foi passado como prop
  useEffect(() => {
    if (!userId && tipoUsuario) {
      supabase.auth.getUser().then(({ data }) => {
        setResolvedUserId(data.user?.id ?? null)
      })
    }
  }, [userId, tipoUsuario])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const dashboardHref =
    tipoUsuario === 'admin'
      ? '/admin'
      : tipoUsuario === 'provider'
      ? '/painel'
      : '/dashboard'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              Vrum <span className="text-orange-500">SOS</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3">
            {tipoUsuario ? (
              <>
                <Link
                  href={dashboardHref}
                  className="text-sm text-gray-600 hover:text-orange-500 font-medium transition-colors"
                >
                  {tipoUsuario === 'admin' ? 'Admin' : tipoUsuario === 'provider' ? 'Meu Painel' : 'Dashboard'}
                </Link>

                <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                  {/* Sino de notificações */}
                  {resolvedUserId && (
                    <NotificationBell userId={resolvedUserId} />
                  )}

                  {/* Avatar + nome */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {nomeUsuario?.split(' ')[0] ?? 'Usuário'}
                    </span>
                  </div>

                  {/* Sair */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Criar conta
                </Link>
              </>
            )}
          </nav>

          {/* Mobile: sino + menu */}
          <div className="md:hidden flex items-center gap-2">
            {tipoUsuario && resolvedUserId && (
              <NotificationBell userId={resolvedUserId} />
            )}
            <button
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          {tipoUsuario ? (
            <>
              <Link
                href={dashboardHref}
                className="block text-sm font-medium text-gray-700 hover:text-orange-500"
                onClick={() => setMenuOpen(false)}
              >
                {tipoUsuario === 'admin' ? 'Painel Admin' : tipoUsuario === 'provider' ? 'Meu Painel' : 'Dashboard'}
              </Link>
              <p className="text-sm text-gray-500">{nomeUsuario}</p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-red-500 font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                Entrar
              </Link>
              <Link href="/register" className="block text-sm font-semibold text-orange-500" onClick={() => setMenuOpen(false)}>
                Criar conta
              </Link>
              <Link href="/provider-register" className="block text-sm font-medium text-gray-700" onClick={() => setMenuOpen(false)}>
                Quero ser prestador
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
