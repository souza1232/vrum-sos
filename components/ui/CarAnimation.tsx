'use client'

import { useEffect, useState } from 'react'

export default function CarAnimation() {
  const [phase, setPhase] = useState<'driving' | 'braking' | 'stopped'>('driving')
  const [mechanicPhase, setMechanicPhase] = useState<'hidden' | 'walking' | 'arrived'>('hidden')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('braking'), 2500)
    const t2 = setTimeout(() => setPhase('stopped'), 3200)
    // Mecânico aparece 0.8s depois do carro parar
    const t3 = setTimeout(() => setMechanicPhase('walking'), 4000)
    // Mecânico chega ao carro 1.8s depois
    const t4 = setTimeout(() => setMechanicPhase('arrived'), 5800)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  return (
    <div className="relative w-full h-64 flex items-end justify-center overflow-hidden select-none">

      {/* Estrada */}
      <div className="absolute bottom-8 left-0 right-0 h-1 bg-gray-600 opacity-40 rounded-full" />

      {/* Linhas da estrada animadas */}
      <div className={`absolute bottom-8 left-0 right-0 flex gap-8 ${phase === 'driving' ? 'animate-road' : ''}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-0.5 w-12 bg-orange-400 opacity-30 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Carro SVG */}
      <div
        className="absolute bottom-9 transition-all"
        style={{
          left: phase === 'driving' ? '10%' : phase === 'braking' ? '45%' : '42%',
          transition: phase === 'driving'
            ? 'left 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            : phase === 'braking'
            ? 'left 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)'
            : 'left 0.3s ease-out',
        }}
      >
        {/* Sombra do carro */}
        <div className="absolute -bottom-1 left-2 right-2 h-2 bg-black opacity-20 rounded-full blur-sm" />

        {/* SVG do carro */}
        <svg width="180" height="80" viewBox="0 0 180 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Corpo do carro */}
          <rect x="10" y="35" width="160" height="30" rx="6" fill="#1e293b" />

          {/* Capô e teto */}
          <path d="M30 35 L55 15 L125 15 L150 35" fill="#1e293b" stroke="#334155" strokeWidth="1" />

          {/* Janelas */}
          <path d="M58 18 L80 18 L80 33 L55 33 Z" fill="#0ea5e9" opacity="0.7" />
          <path d="M83 18 L122 18 L122 33 L83 33 Z" fill="#0ea5e9" opacity="0.7" />

          {/* Detalhes laranja */}
          <rect x="10" y="48" width="160" height="3" rx="1" fill="#f97316" opacity="0.6" />

          {/* Farol dianteiro */}
          <rect x="148" y="40" width="14" height="8" rx="3" fill="#fbbf24" opacity="0.9" />
          {/* Luz do farol */}
          {phase === 'driving' && (
            <ellipse cx="168" cy="44" rx="12" ry="5" fill="#fbbf24" opacity="0.15" />
          )}

          {/* Farol traseiro */}
          <rect x="8" y="40" width="10" height="8" rx="2" fill="#ef4444" opacity={phase === 'braking' ? '1' : '0.4'} />
          {phase === 'braking' && (
            <ellipse cx="6" cy="44" rx="10" ry="4" fill="#ef4444" opacity="0.3" />
          )}

          {/* Roda traseira */}
          <circle cx="45" cy="65" r="13" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <circle cx="45" cy="65" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <g style={{
            transformOrigin: '45px 65px',
            animation: phase === 'driving' ? 'spin 0.4s linear infinite' : phase === 'braking' ? 'spin 0.4s linear 2' : 'none'
          }}>
            <line x1="45" y1="57" x2="45" y2="73" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="37" y1="65" x2="53" y2="65" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="39.5" y1="59.5" x2="50.5" y2="70.5" stroke="#94a3b8" strokeWidth="1" />
            <line x1="50.5" y1="59.5" x2="39.5" y2="70.5" stroke="#94a3b8" strokeWidth="1" />
          </g>

          {/* Roda dianteira */}
          <circle cx="135" cy="65" r="13" fill="#0f172a" stroke="#475569" strokeWidth="2" />
          <circle cx="135" cy="65" r="8" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <g style={{
            transformOrigin: '135px 65px',
            animation: phase === 'driving' ? 'spin 0.4s linear infinite' : phase === 'braking' ? 'spin 0.4s linear 2' : 'none'
          }}>
            <line x1="135" y1="57" x2="135" y2="73" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="127" y1="65" x2="143" y2="65" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="129.5" y1="59.5" x2="140.5" y2="70.5" stroke="#94a3b8" strokeWidth="1" />
            <line x1="140.5" y1="59.5" x2="129.5" y2="70.5" stroke="#94a3b8" strokeWidth="1" />
          </g>

          {/* Grade frontal */}
          <rect x="152" y="52" width="10" height="5" rx="1" fill="#334155" />
        </svg>

        {/* Fumaça de escapamento (quando parado) */}
        {phase === 'stopped' && (
          <div className="absolute bottom-6 -left-4 flex flex-col gap-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full opacity-0 animate-smoke1" />
            <div className="w-2 h-2 bg-gray-400 rounded-full opacity-0 animate-smoke2" />
            <div className="w-4 h-4 bg-gray-300 rounded-full opacity-0 animate-smoke3" />
          </div>
        )}
      </div>

      {/* Ícone de alerta/SOS quando para */}
      {phase === 'stopped' && (
        <div className="absolute top-4 animate-bounce-in" style={{ left: 'calc(42% + 60px)' }}>
          <div className="bg-orange-500 text-white text-xs font-black px-2 py-1 rounded-lg shadow-lg shadow-orange-500/40">
            SOS!
          </div>
        </div>
      )}

      {/* Mecânico SVG */}
      {mechanicPhase !== 'hidden' && (
        <div
          className="absolute bottom-9"
          style={{
            right: mechanicPhase === 'walking' ? '5%' : '22%',
            transition: 'right 1.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <svg width="52" height="90" viewBox="0 0 52 90" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cabeça */}
            <circle cx="26" cy="12" r="10" fill="#f5c5a3" />
            {/* Capacete */}
            <path d="M16 10 Q16 2 26 2 Q36 2 36 10 Z" fill="#1e293b" />
            <rect x="14" y="9" width="24" height="4" rx="2" fill="#f97316" />

            {/* Corpo - colete laranja */}
            <rect x="17" y="22" width="18" height="26" rx="3" fill="#f97316" />
            {/* Bolso do colete */}
            <rect x="19" y="26" width="6" height="5" rx="1" fill="#ea6010" />
            {/* Texto VRUM SOS no colete */}
            <text x="26" y="37" textAnchor="middle" fontSize="4" fontWeight="bold" fill="white" fontFamily="Arial">VRUM</text>
            <text x="26" y="42" textAnchor="middle" fontSize="4" fontWeight="bold" fill="white" fontFamily="Arial">SOS</text>

            {/* Braço esquerdo */}
            <rect x="9" y="22" width="8" height="16" rx="4" fill="#f5c5a3" />
            {/* Mão esquerda */}
            <circle cx="13" cy="39" r="4" fill="#f5c5a3" />

            {/* Braço direito - levantado se chegou */}
            <g
              style={{
                transformOrigin: '43px 24px',
                transform: mechanicPhase === 'arrived' ? 'rotate(-80deg)' : 'rotate(0deg)',
                transition: 'transform 0.5s ease-out',
              }}
            >
              <rect x="35" y="22" width="8" height="20" rx="4" fill="#f5c5a3" />
              {/* Chave inglesa */}
              <g style={{ transform: 'translate(35px, 40px)' }}>
                <rect x="0" y="0" width="5" height="18" rx="2" fill="#64748b" />
                <rect x="-2" y="0" width="9" height="5" rx="2" fill="#94a3b8" />
                <rect x="-1" y="13" width="7" height="5" rx="2" fill="#94a3b8" />
              </g>
            </g>

            {/* Calças com animação de caminhada */}
            <g style={{
              transformOrigin: '20px 46px',
              animation: mechanicPhase === 'walking' ? 'legLeft 0.5s ease-in-out infinite alternate' : 'none',
            }}>
              <rect x="17" y="46" width="7" height="22" rx="3" fill="#1e293b" />
              <ellipse cx="20" cy="68" rx="6" ry="3" fill="#0f172a" />
            </g>
            <g style={{
              transformOrigin: '32px 46px',
              animation: mechanicPhase === 'walking' ? 'legRight 0.5s ease-in-out infinite alternate' : 'none',
            }}>
              <rect x="28" y="46" width="7" height="22" rx="3" fill="#1e293b" />
              <ellipse cx="32" cy="68" rx="6" ry="3" fill="#0f172a" />
            </g>
          </svg>

          {/* Balão de fala "Pode deixar!" quando chega */}
          {mechanicPhase === 'arrived' && (
            <div
              className="absolute -top-8 -left-16 bg-white border border-orange-200 text-orange-600 text-xs font-bold px-2 py-1 rounded-xl shadow-md whitespace-nowrap animate-bounce-in"
              style={{ borderRadius: '10px 10px 2px 10px' }}
            >
              Pode deixar! 🔧
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes smoke1 {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          20% { opacity: 0.6; }
          100% { opacity: 0; transform: translateY(-20px) scale(2); }
        }
        @keyframes smoke2 {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          30% { opacity: 0.4; }
          100% { opacity: 0; transform: translateY(-15px) scale(1.8); }
        }
        @keyframes smoke3 {
          0% { opacity: 0; transform: translateY(0) scale(1); }
          40% { opacity: 0.3; }
          100% { opacity: 0; transform: translateY(-25px) scale(2.5); }
        }
        .animate-smoke1 {
          animation: smoke1 1.5s ease-out infinite;
        }
        .animate-smoke2 {
          animation: smoke2 1.5s ease-out 0.3s infinite;
        }
        .animate-smoke3 {
          animation: smoke3 1.5s ease-out 0.6s infinite;
        }
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.5) translateY(10px); }
          70% { transform: scale(1.2) translateY(-3px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s ease-out forwards;
        }
        @keyframes legLeft {
          from { transform: rotate(-18deg); }
          to { transform: rotate(18deg); }
        }
        @keyframes legRight {
          from { transform: rotate(18deg); }
          to { transform: rotate(-18deg); }
        }
      `}</style>
    </div>
  )
}
