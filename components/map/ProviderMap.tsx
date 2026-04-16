'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Provider, TIPOS_SERVICO_LABELS, TipoServico } from '@/types'
import Link from 'next/link'

// Fix do ícone padrão do Leaflet no Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const iconHighlight = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface ProviderMapProps {
  providers: Provider[]
  highlightId?: string
  center?: [number, number]
  zoom?: number
  showRadius?: boolean
}

function MapCenterUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, zoom, map])
  return null
}

export default function ProviderMap({
  providers,
  highlightId,
  center = [-15.7801, -47.9292], // Brasília como default
  zoom = 6,
  showRadius = false,
}: ProviderMapProps) {
  const withCoords = providers.filter(p => p.latitude && p.longitude)

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '1rem' }}
      scrollWheelZoom={true}
    >
      <MapCenterUpdater center={center} zoom={zoom} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {withCoords.map(p => {
        const isHighlight = p.id === highlightId
        const position: [number, number] = [p.latitude!, p.longitude!]

        return (
          <div key={p.id}>
            <Marker
              position={position}
              icon={isHighlight ? iconHighlight : icon}
            >
              <Popup maxWidth={260} className="provider-popup">
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {p.nome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{p.nome}</p>
                      <p className="text-xs text-gray-500">{p.cidade}, {p.estado}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {p.tipos_servico.slice(0, 2).map(t => (
                      <span key={t} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                        {TIPOS_SERVICO_LABELS[t as TipoServico] ?? t}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {p.atende_24h && <span className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full">24h</span>}
                    {p.atendimento_emergencial && <span className="text-xs text-red-700 bg-red-50 px-1.5 py-0.5 rounded-full">Emergência</span>}
                  </div>

                  <div className="flex gap-2">
                    {p.whatsapp && (
                      <a
                        href={`https://wa.me/55${p.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center text-xs font-semibold bg-green-500 hover:bg-green-600 text-white py-1.5 rounded-lg transition-colors"
                      >
                        WhatsApp
                      </a>
                    )}
                    <Link
                      href={`/dashboard/providers/${p.id}`}
                      className="flex-1 text-center text-xs font-semibold border border-gray-200 hover:bg-gray-50 text-gray-700 py-1.5 rounded-lg transition-colors"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Círculo de raio de atendimento */}
            {(showRadius || isHighlight) && p.raio_km && (
              <Circle
                center={position}
                radius={p.raio_km * 1000}
                pathOptions={{
                  color: isHighlight ? '#f97316' : '#3b82f6',
                  fillColor: isHighlight ? '#f97316' : '#3b82f6',
                  fillOpacity: 0.05,
                  weight: 1.5,
                  dashArray: '4 4',
                }}
              />
            )}
          </div>
        )
      })}
    </MapContainer>
  )
}
