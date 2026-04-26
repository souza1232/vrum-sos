'use client'

import Link from 'next/link'
import { Zap, Search, Wrench, Truck, Circle, Key } from 'lucide-react'

const ATALHOS = [
  { href: '/buscar?tipo=mecanico', label: 'Mecânico', icon: Wrench, cor: 'bg-blue-500/20 border-blue-500/30 text-blue-300 hover:border-blue-400' },
  { href: '/buscar?tipo=guincho', label: 'Guincho', icon: Truck, cor: 'bg-red-500/20 border-red-500/30 text-red-300 hover:border-red-400' },
  { href: '/buscar?tipo=borracheiro', label: 'Borracheiro', icon: Circle, cor: 'bg-green-500/20 border-green-500/30 text-green-300 hover:border-green-400' },
  { href: '/buscar?tipo=chaveiro', label: 'Chaveiro', icon: Key, cor: 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:border-purple-400' },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4 text-center">
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">
          Vrum <span className="text-orange-400">SOS</span>
        </span>
      </Link>

      <div className="text-8xl font-black text-slate-800 leading-none select-none mb-4">404</div>

      <h1 className="text-2xl font-bold text-white mb-3">Página não encontrada</h1>
      <p className="text-gray-400 max-w-sm mb-10 leading-relaxed">
        Mas se você está precisando de socorro automotivo, a gente tem prestadores prontos para te ajudar.
      </p>

      <Link
        href="/buscar"
        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl transition-colors mb-10"
      >
        <Search className="w-5 h-5" />
        Buscar prestadores perto de mim
      </Link>

      <p className="text-xs text-gray-600 uppercase tracking-widest mb-4">ou escolha o serviço</p>

      <div className="flex flex-wrap gap-3 justify-center">
        {ATALHOS.map(a => (
          <Link
            key={a.href}
            href={a.href}
            className={`inline-flex items-center gap-2 border px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${a.cor}`}
          >
            <a.icon className="w-4 h-4" />
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
