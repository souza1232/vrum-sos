'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const TTL_HORAS = 24

export default function ViewTracker({ providerId }: { providerId: string }) {
  useEffect(() => {
    const key = `vrum_viewed_${providerId}`
    const ts = localStorage.getItem(key)
    const horasPassadas = ts ? (Date.now() - parseInt(ts)) / (1000 * 60 * 60) : Infinity
    if (horasPassadas < TTL_HORAS) return

    const supabase = createClient()
    supabase.from('profile_views').insert({ provider_id: providerId }).then(() => {
      localStorage.setItem(key, Date.now().toString())
    })
  }, [providerId])

  return null
}
