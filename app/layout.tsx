import type { Metadata } from 'next'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
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
    // Quem precisa de serviço
    'assistência automotiva',
    'mecânico perto de mim',
    'guincho 24h',
    'borracheiro perto de mim',
    'chaveiro automotivo',
    'socorro automotivo',
    'mecânico emergência',
    'guincho emergência',
    'carro quebrado o que fazer',
    'mecânico a domicílio',
    'borracheiro 24h',
    'eletricista automotivo',
    'assistência veicular',
    // Quem quer prestar serviço
    'cadastrar prestador automotivo',
    'plataforma para mecânicos',
    'app para prestadores automotivos',
    'trabalhar como mecânico autônomo',
    'como conseguir clientes mecânico',
    'guincheiro autônomo',
    'plataforma automotiva prestadores',
    'anunciar serviço mecânico',
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
  verification: {
    google: '6SUc_yv8_ahc6bqnvMXMX5mFZ04TD_EYtzTXVyvUM0A',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-NYZZP3F1XT" strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-NYZZP3F1XT');
      `}</Script>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
