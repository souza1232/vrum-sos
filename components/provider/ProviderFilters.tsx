'use client'

import { useState, useCallback } from 'react'
import { ProviderFilters, TIPOS_SERVICO_LIST, TIPOS_SERVICO_LABELS, TipoServico } from '@/types'
import { Search, MapPin, Filter, X, Navigation, Star } from 'lucide-react'
import Button from '@/components/ui/Button'

interface ProviderFiltersProps {
  onFilter: (filters: ProviderFilters) => void
  loading?: boolean
}

export default function ProviderFiltersComponent({ onFilter, loading }: ProviderFiltersProps) {
  const [cidade, setCidade] = useState('')
  const [tipoServico, setTipoServico] = useState<TipoServico | ''>('')
  const [busca, setBusca] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)

  function handleFilter(overrides?: Partial<ProviderFilters>) {
    onFilter({
      cidade: cidade || undefined,
      tipo_servico: tipoServico || undefined,
      busca: busca || undefined,
      min_rating: minRating || undefined,
      userLat: userCoords?.lat,
      userLng: userCoords?.lng,
      ...overrides,
    })
  }

  function handleClear() {
    setCidade('')
    setTipoServico('')
    setBusca('')
    setMinRating(0)
    setUserCoords(null)
    onFilter({})
  }

  function handleGPS() {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserCoords(coords)
        setGpsLoading(false)
        onFilter({
          cidade: cidade || undefined,
          tipo_servico: tipoServico || undefined,
          busca: busca || undefined,
          min_rating: minRating || undefined,
          userLat: coords.lat,
          userLng: coords.lng,
        })
      },
      () => setGpsLoading(false),
      { timeout: 8000 }
    )
  }

  const hasFilters = cidade || tipoServico || busca || minRating > 0 || userCoords

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-orange-500" />
        <h2 className="font-semibold text-gray-700 text-sm">Filtrar prestadores</h2>
        {userCoords && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            <Navigation className="w-3 h-3" />
            Filtrando por raio de atendimento
          </span>
        )}
      </div>

      {/* Linha 1: busca, cidade, tipo */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFilter()}
            placeholder="Buscar por nome..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFilter()}
            placeholder="Filtrar por cidade..."
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <select
          value={tipoServico}
          onChange={e => setTipoServico(e.target.value as TipoServico | '')}
          className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-gray-700"
        >
          <option value="">Todos os serviços</option>
          {TIPOS_SERVICO_LIST.map(tipo => (
            <option key={tipo} value={tipo}>{TIPOS_SERVICO_LABELS[tipo]}</option>
          ))}
        </select>
      </div>

      {/* Linha 2: avaliação mínima + GPS + botões */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Avaliação mínima */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">Avaliação mínima:</span>
          <div className="flex gap-1">
            {[0, 3, 4, 5].map(val => (
              <button
                key={val}
                onClick={() => { setMinRating(val); handleFilter({ min_rating: val || undefined }) }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  minRating === val
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {val === 0 ? 'Todos' : (
                  <><Star className="w-3 h-3" />{val}+</>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="ml-auto flex gap-2">
          {/* GPS */}
          <button
            onClick={handleGPS}
            disabled={gpsLoading}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
              userCoords
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            } disabled:opacity-60`}
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
            {gpsLoading ? 'Buscando...' : userCoords ? 'Localização ativa' : 'Usar minha localização'}
          </button>

          <Button onClick={() => handleFilter()} loading={loading} size="md">
            <Search className="w-4 h-4" />
            Buscar
          </Button>

          {hasFilters && (
            <Button onClick={handleClear} variant="ghost" size="md">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
