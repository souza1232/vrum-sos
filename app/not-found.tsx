'use client'

import Link from 'next/link'
import { Zap, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">
          Vrum <span className="text-orange-400">SOS</span>
        </span>
      </Link>

      {/* 404 */}
      <div className="text-9xl font-black text-slate-800 leading-none select-none mb-4">404</div>

      <h1 className="text-2xl font-bold text-white mb-3">Página não encontrada</h1>
      <p className="text-gray-400 max-w-sm mb-10 leading-relaxed">
        A página que você está procurando não existe ou foi removida.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" />
          Ir para o início
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 border border-slate-600 hover:border-slate-400 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
      </div>
    </div>
  )
}
