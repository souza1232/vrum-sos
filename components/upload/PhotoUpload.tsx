'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2, X, User } from 'lucide-react'
import Image from 'next/image'

interface PhotoUploadProps {
  userId: string
  currentUrl?: string | null
  onUpload: (url: string) => void
}

export default function PhotoUpload({ userId, currentUrl, onUpload }: PhotoUploadProps) {
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file: File) {
    if (!file) return

    // Validações
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB.')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Formato inválido. Use JPG, PNG ou WebP.')
      return
    }

    setError('')
    setUploading(true)

    // Preview local imediato
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    try {
      const ext = file.name.split('.').pop()
      const path = `${userId}/photo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('provider-photos')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setError('Erro no upload. Tente novamente.')
        setPreview(currentUrl ?? null)
        return
      }

      const { data } = supabase.storage
        .from('provider-photos')
        .getPublicUrl(path)

      onUpload(data.publicUrl)
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreview(null)
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Preview */}
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
          {preview ? (
            <Image
              src={preview}
              alt="Foto do prestador"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <User className="w-10 h-10 text-gray-300" />
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>

        {preview && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Botão de upload */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50"
      >
        <Camera className="w-4 h-4" />
        {preview ? 'Trocar foto' : 'Adicionar foto'}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      <p className="text-xs text-gray-400">JPG, PNG ou WebP · máximo 5MB</p>
    </div>
  )
}
