import { ReactNode } from 'react'
import Link from 'next/link'
import Header from './Header'
import { LayoutDashboard, FileText, Heart, UserCircle } from 'lucide-react'

interface UserLayoutProps {
  children: ReactNode
  nomeUsuario?: string
  tipoUsuario?: 'user' | 'provider' | 'admin'
  activeTab?: 'dashboard' | 'solicitacoes' | 'favoritos' | 'perfil'
}

const navItems = [
  { href: '/dashboard', label: 'Buscar prestadores', icon: LayoutDashboard, id: 'dashboard' },
  { href: '/dashboard/solicitacoes', label: 'Minhas solicitações', icon: FileText, id: 'solicitacoes' },
  { href: '/dashboard/favoritos', label: 'Favoritos', icon: Heart, id: 'favoritos' },
  { href: '/dashboard/perfil', label: 'Meu Perfil', icon: UserCircle, id: 'perfil' },
]

export default function UserLayout({ children, nomeUsuario, tipoUsuario = 'user', activeTab }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header tipoUsuario={tipoUsuario} nomeUsuario={nomeUsuario} />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Sub navegação */}
        <nav className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-8 overflow-x-auto w-fit">
          {navItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}
