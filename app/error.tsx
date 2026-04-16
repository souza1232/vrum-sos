'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Vrum SOS Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">Algo deu errado</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Ocorreu um erro inesperado. Tente novamente ou volte para o início.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  )
}
