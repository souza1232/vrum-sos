'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import UserLayout from '@/components/layout/UserLayout'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { PageSpinner } from '@/components/ui/Spinner'
import { UserCircle, Camera, Lock, Save, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

interface Profile {
  id: string
  nome: string
  email: string
  tipo_usuario: 'user' | 'provider' | 'admin'
  foto_url?: string | null
}

export default function PerfilPage() {
  const supabase = createClient()
  const { showToast, ToastComponent } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [nome, setNome] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Senha
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('id, nome, email, tipo_usuario, foto_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
        setNome(data.nome)
        if ((data as any).foto_url) setPreviewUrl((data as any).foto_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('Foto deve ter no máximo 5MB.', 'error')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Use JPG, PNG ou WebP.', 'error')
      return
    }

    setUploadingPhoto(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('provider-photos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      showToast('Erro ao fazer upload da foto.', 'error')
      setUploadingPhoto(false)
      return
    }

    const { data: urlData } = supabase.storage.from('provider-photos').getPublicUrl(path)
    const foto_url = `${urlData.publicUrl}?t=${Date.now()}`

    await supabase.from('profiles').update({ foto_url }).eq('id', profile.id)

    setPreviewUrl(foto_url)
    setProfile(prev => prev ? { ...prev, foto_url } : prev)
    showToast('Foto atualizada!', 'success')
    setUploadingPhoto(false)
  }

  async function handleSaveProfile() {
    if (!profile || !nome.trim()) return
    setSavingProfile(true)
    const { error } = await supabase.from('profiles').update({ nome: nome.trim() }).eq('id', profile.id)
    if (error) {
      showToast('Erro ao salvar.', 'error')
    } else {
      setProfile(prev => prev ? { ...prev, nome: nome.trim() } : prev)
      showToast('Perfil atualizado!', 'success')
    }
    setSavingProfile(false)
  }

  async function handleChangePassword() {
    if (!novaSenha || !confirmarSenha) return
    if (novaSenha !== confirmarSenha) {
      showToast('As senhas não coincidem.', 'error')
      return
    }
    if (novaSenha.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres.', 'error')
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) {
      showToast('Erro ao alterar senha. Tente fazer login novamente.', 'error')
    } else {
      showToast('Senha alterada com sucesso!', 'success')
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    }
    setSavingPassword(false)
  }

  if (loading) return (
    <UserLayout activeTab="perfil">
      <PageSpinner />
    </UserLayout>
  )

  return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome} activeTab="perfil">
      {ToastComponent}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-orange-500" />
          Meu Perfil
        </h1>
        <p className="text-gray-500 mt-1">Gerencie suas informações pessoais e segurança.</p>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Foto + nome */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-slate-900 text-sm">Informações pessoais</h2>

          {/* Foto */}
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-orange-500 flex items-center justify-center flex-shrink-0">
              {previewUrl ? (
                <Image src={previewUrl} alt="Avatar" fill className="object-cover" unoptimized />
              ) : (
                <span className="text-white font-black text-3xl">{profile?.nome?.charAt(0)}</span>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
            <div>
              <p className="font-medium text-gray-800">{profile?.nome}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium mt-1"
              >
                {uploadingPhoto ? 'Enviando...' : 'Trocar foto'}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Seu nome completo"
            />
          </div>

          <Button onClick={handleSaveProfile} loading={savingProfile} fullWidth>
            <Save className="w-4 h-4" />
            Salvar alterações
          </Button>
        </div>

        {/* Alterar senha */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-orange-500" />
              Alterar senha
            </h2>
            <button
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPasswords ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nova senha</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirmar nova senha</label>
              <input
                type={showPasswords ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={e => setConfirmarSenha(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Repita a nova senha"
              />
            </div>
          </div>

          <Button
            onClick={handleChangePassword}
            loading={savingPassword}
            variant="outline"
            fullWidth
            disabled={!novaSenha || !confirmarSenha}
          >
            <Lock className="w-4 h-4" />
            Alterar senha
          </Button>
        </div>
      </div>
    </UserLayout>
  )
}
