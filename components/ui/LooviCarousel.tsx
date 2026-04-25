'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'

const LOOVI_LINK = 'https://loovi.com.br/52489/Q0FUX0FERVNBT18yOTk=?utm_source=escvir&utm_medium=meusite'

const banners = [
  { src: '/banners/loovi-1.png', alt: 'Loovi Seguro Auto - Banner 1' },
  { src: '/banners/loovi-2.png', alt: 'Loovi Seguro Auto - Banner 2' },
  { src: '/banners/loovi-3.png', alt: 'Loovi Seguro Auto - Banner 3' },
  { src: '/banners/loovi-4.png', alt: 'Loovi Seguro Auto - Banner 4' },
]

export default function LooviCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  function prev(e: React.MouseEvent) {
    e.preventDefault()
    setCurrent(prev => (prev - 1 + banners.length) % banners.length)
  }

  function next(e: React.MouseEvent) {
    e.preventDefault()
    setCurrent(prev => (prev + 1) % banners.length)
  }

  return (
    <div className="relative w-full">
      {/* Card do banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg bg-[#6B72F5] h-52 sm:h-64 lg:h-72">

        {/* Imagens */}
        {banners.map((banner, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={banner.src}
              alt={banner.alt}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        ))}

        {/* Setas */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center z-10"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center z-10"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.preventDefault(); setCurrent(i) }}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-5' : 'bg-white/50 w-1.5'}`}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="absolute bottom-3 right-3 z-10">
          <a
            href={LOOVI_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/90 hover:bg-white text-[#6B72F5] font-semibold px-3 py-1.5 rounded-lg text-xs shadow transition-colors active:scale-95"
          >
            <ExternalLink className="w-3 h-3" />
            Saiba mais
          </a>
        </div>
      </div>
    </div>
  )
}
