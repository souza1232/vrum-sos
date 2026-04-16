'use client'

import { useState, useCallback } from 'react'
import { fetchApprovedProviders } from '@/services/provider.service'
import { Provider, ProviderFilters } from '@/types'

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (filters: ProviderFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchApprovedProviders(filters)
      setProviders(data)
    } catch (err) {
      setError('Erro ao buscar prestadores.')
    } finally {
      setLoading(false)
    }
  }, [])

  return { providers, loading, error, search }
}
