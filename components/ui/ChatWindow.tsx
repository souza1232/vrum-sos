'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
}

interface ChatWindowProps {
  currentUserId: string
  otherUserId: string
  providerId: string
  otherUserName: string
}

export default function ChatWindow({ currentUserId, otherUserId, providerId, otherUserName }: ChatWindowProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()

    const channel = supabase
      .channel(`chat_${providerId}_${[currentUserId, otherUserId].sort().join('_')}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `provider_id=eq.${providerId}`,
      }, (payload) => {
        const msg = payload.new as Message
        if (msg.sender_id === otherUserId || msg.sender_id === currentUserId) {
          setMessages(prev => [...prev, msg])
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [providerId, currentUserId, otherUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('provider_id', providerId)
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order('created_at', { ascending: true })

    setMessages((data ?? []) as Message[])

    // Marcar mensagens recebidas como lidas
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('receiver_id', currentUserId)
      .eq('provider_id', providerId)
      .is('read_at', null)
  }

  async function sendMessage() {
    if (!content.trim() || sending) return
    setSending(true)
    const text = content.trim()
    setContent('')

    await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: otherUserId,
      provider_id: providerId,
      content: text,
    })

    setSending(false)
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <p className="font-semibold text-slate-800 text-sm">{otherUserName}</p>
        <p className="text-xs text-gray-400">Conversa privada</p>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-sm text-gray-400 mt-10">
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                isMine
                  ? 'bg-orange-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}>
                <p className="leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-orange-200' : 'text-gray-400'}`}>
                  {formatDate(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Digite sua mensagem..."
          className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
        <button
          onClick={sendMessage}
          disabled={!content.trim() || sending}
          className="w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
