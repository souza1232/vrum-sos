import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vrum SOS — Assistência Automotiva na sua região',
  description:
    'Encontre mecânicos, guincheiros, borracheiros e outros prestadores de serviço automotivo próximos de você. Rápido, confiável e disponível 24h.',
  keywords: 'assistência automotiva, mecânico, guincho, borracheiro, chaveiro, socorro automotivo',
  openGraph: {
    title: 'Vrum SOS — Assistência Automotiva',
    description: 'Conectamos você ao prestador certo, na hora certa.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
