import Link from 'next/link'
import { Zap } from 'lucide-react'
import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="py-6 px-4 flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">
            Vrum <span className="text-orange-500">SOS</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        {children}
      </div>
    </div>
  )
}
