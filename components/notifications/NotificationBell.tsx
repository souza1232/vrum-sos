'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  created_at: string
}

const TIPO_COLORS: Record<string, string> = {
  request: 'bg-blue-50 border-blue-200',
  approval: 'bg-green-50 border-green-200',
  status: 'bg-orange-50 border-orange-200',
  info: 'bg-gray-50 border-gray-200',
}

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.lida).length

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Carregar notificações
  useEffect(() => {
    fetchNotifications()

    // Realtime: ouvir novas notificações
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        payload => {
          setNotifications(prev => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  async function fetchNotifications() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setNotifications(data as Notification[])
    setLoading(false)
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ lida: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
  }

  async function markAllAsRead() {
    await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('user_id', userId)
      .eq('lida', false)

    setNotifications(prev => prev.map(n => ({ ...n, lida: true })))
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão sino */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications() }}
        className="relative p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900 text-sm">Notificações</span>
              {unread > 0 && (
                <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full">
                  {unread} nova{unread !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="py-8 text-center text-gray-400 text-sm">Carregando...</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors',
                      !n.lida && 'bg-blue-50/30'
                    )}
                  >
                    {/* Indicador não lida */}
                    <div className="flex-shrink-0 mt-1.5">
                      {!n.lida ? (
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      ) : (
                        <div className="w-2 h-2" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium', !n.lida ? 'text-gray-900' : 'text-gray-600')}>
                        {n.titulo}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.mensagem}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at)}</p>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.lida && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="p-1 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50 transition-colors"
                          title="Marcar como lida"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remover"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
