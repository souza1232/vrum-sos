'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'

interface Props {
  providerId: string
}

export default function PushNotificationButton({ providerId }: Props) {
  const [status, setStatus] = useState<'loading' | 'unsupported' | 'denied' | 'active' | 'inactive'>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    const perm = Notification.permission
    if (perm === 'denied') { setStatus('denied'); return }
    if (perm === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setStatus(sub ? 'active' : 'inactive')
        })
      })
    } else {
      setStatus('inactive')
    }
  }, [])

  async function ativar() {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub.toJSON(), providerId }),
      })

      setStatus('active')
    } catch {
      setStatus('inactive')
    }
  }

  async function desativar() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
    setStatus('inactive')
  }

  if (status === 'loading') return null
  if (status === 'unsupported') return null

  if (status === 'denied') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
        <BellOff className="w-4 h-4 shrink-0" />
        Notificações bloqueadas. Habilite nas configurações do navegador.
      </div>
    )
  }

  if (status === 'active') {
    return (
      <button
        onClick={desativar}
        className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-xl px-4 py-3 transition-colors w-full"
      >
        <BellRing className="w-4 h-4 shrink-0 text-green-600" />
        <span><strong>Notificações ativas</strong> — você receberá alertas de novos chamados SOS</span>
      </button>
    )
  }

  return (
    <button
      onClick={ativar}
      className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100 rounded-xl px-4 py-3 transition-colors w-full"
    >
      <Bell className="w-4 h-4 shrink-0 text-orange-500" />
      <span><strong>Ativar notificações</strong> — receba alertas no celular quando chegar um chamado SOS</span>
    </button>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}
