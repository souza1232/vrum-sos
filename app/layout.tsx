import type { Metadata } from 'next'
import './globals.css'

const APP_URL = 'https://vrumsos.com.br'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Vrum SOS — Assistência Automotiva na sua região',
    template: '%s | Vrum SOS',
  },
  description:
    'Encontre mecânicos, guincheiros, borracheiros, chaveiros e guincho próximos de você. Assistência automotiva 24h, rápida e confiável.',
  keywords: [
    'assistência automotiva',
    'mecânico perto de mim',
    'guincho 24h',
    'borracheiro',
    'chaveiro automotivo',
    'socorro automotivo',
    'mecânico emergência',
    'guincho emergência',
    'vrum sos',
  ],
  authors: [{ name: 'Vrum SOS' }],
  creator: 'Vrum SOS',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: APP_URL,
    siteName: 'Vrum SOS',
    title: 'Vrum SOS — Assistência Automotiva na sua região',
    description: 'Encontre mecânicos, guincheiros, borracheiros e chaveiros perto de você. Disponível 24h.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vrum SOS — Assistência Automotiva',
    description: 'Encontre mecânicos, guincheiros, borracheiros e chaveiros perto de você.',
  },
  alternates: {
    canonical: APP_URL,
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
