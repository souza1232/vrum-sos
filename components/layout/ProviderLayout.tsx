import { ReactNode } from 'react'
import Link from 'next/link'
import Header from './Header'
import { LayoutDashboard, FileText, User, MessageSquare } from 'lucide-react'

interface ProviderLayoutProps {
  children: ReactNode
  nomeUsuario?: string
  activeTab?: 'painel' | 'solicitacoes' | 'mensagens'
}

const navItems = [
  { href: '/painel', label: 'Meu Perfil', icon: User, id: 'painel' },
  { href: '/painel/solicitacoes', label: 'Solicitações recebidas', icon: FileText, id: 'solicitacoes' },
  { href: '/painel/mensagens', label: 'Mensagens', icon: MessageSquare, id: 'mensagens' },
]

export default function ProviderLayout({ children, nomeUsuario, activeTab }: ProviderLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header tipoUsuario="provider" nomeUsuario={nomeUsuario} />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Sub navegação */}
        <nav className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-200 mb-6 overflow-x-auto w-full">
          {navItems.map(item => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-1 ${
                activeTab === item.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}
