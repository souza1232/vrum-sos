import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              Vrum <span className="text-orange-400">SOS</span>
            </span>
          </div>

          <p className="text-sm text-center">
            Conectando você ao suporte automotivo certo, na hora certa.
          </p>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">
              Entrar
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Criar conta
            </Link>
            <Link href="/provider-register" className="hover:text-white transition-colors">
              Seja prestador
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Vrum SOS. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
