/**
 * Geocodificação usando Nominatim (OpenStreetMap) — gratuito, sem API key.
 * Limite de uso: 1 req/segundo. Ideal para MVP.
 */

export interface Coordinates {
  lat: number
  lng: number
}

export async function geocodeCity(
  cidade: string,
  estado: string,
  pais = 'Brazil'
): Promise<Coordinates | null> {
  try {
    const query = encodeURIComponent(`${cidade}, ${estado}, ${pais}`)
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&addressdetails=0`

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VrumSOS/1.0 (assistencia-automotiva)',
        'Accept-Language': 'pt-BR',
      },
      next: { revalidate: 86400 }, // cache por 24h
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!data || data.length === 0) return null

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }
  } catch {
    return null
  }
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const query = encodeURIComponent(address)
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`

    const res = await fetch(url, {
      headers: { 'User-Agent': 'VrumSOS/1.0' },
    })

    if (!res.ok) return null
    const data = await res.json()
    if (!data || data.length === 0) return null

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    }
  } catch {
    return null
  }
}
