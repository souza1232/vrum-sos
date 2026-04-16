import { ReactNode } from 'react'
import Header from './Header'

interface DashboardLayoutProps {
  children: ReactNode
  tipoUsuario?: 'user' | 'provider' | 'admin'
  nomeUsuario?: string
}

export default function DashboardLayout({ children, tipoUsuario, nomeUsuario }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header tipoUsuario={tipoUsuario} nomeUsuario={nomeUsuario} />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
