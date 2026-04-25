'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Flag, X } from 'lucide-react'
import Button from './Button'

const MOTIVOS = [
  'Não compareceu ao atendimento',
  'Demorou muito para responder',
  'Fez um serviço de má qualidade',
  'Cobrou valor diferente do combinado',
  'Comportamento inadequado',
  'Perfil com informações falsas',
  'Outro motivo',
]

interface ReportModalProps {
  providerId: string
  providerNome: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export default function ReportModal({ providerId, providerNome, userId, onClose, onSuccess }: ReportModalProps) {
  const supabase = createClient()
  const [motivo, setMotivo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [sending, setSending] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit() {
    if (!motivo) { setErro('Selecione um motivo.'); return }
    setSending(true)
    setErro('')

    const { error } = await supabase.from('reports').insert({
      provider_id: providerId,
      user_id: userId,
      motivo,
      descricao: descricao.trim() || null,
    })

    setSending(false)

    if (error) {
      setErro('Erro ao enviar denúncia. Tente novamente.')
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-slate-900">Denunciar prestador</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">
            Você está denunciando <span className="font-semibold text-gray-800">{providerNome}</span>.
            Sua denúncia será analisada pelo nosso time.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Motivo da denúncia</label>
            <div className="space-y-2">
              {MOTIVOS.map(m => (
                <button
                  key={m}
                  onClick={() => setMotivo(m)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                    motivo === m
                      ? 'border-red-400 bg-red-50 text-red-700 font-medium'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detalhes <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descreva o que aconteceu..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{erro}</p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <Button variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button
            fullWidth
            loading={sending}
            onClick={handleSubmit}
            className="!bg-red-500 hover:!bg-red-600"
          >
            <Flag className="w-4 h-4" />
            Enviar denúncia
          </Button>
        </div>
      </div>
    </div>
  )
}
