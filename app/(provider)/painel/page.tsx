'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Provider, TIPOS_SERVICO_LABELS, TipoServico, TIPOS_SERVICO_LIST, ESTADOS_BR } from '@/types'
import ProviderLayout from '@/components/layout/ProviderLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { useToast } from '@/components/ui/Toast'
import PhotoUpload from '@/components/upload/PhotoUpload'
import { geocodeCity } from '@/lib/geocoding'
import {
  Wrench, Clock, MapPin, Phone, MessageCircle,
  AlertCircle, CheckCircle, Edit3, Save, X, FileText, TrendingUp, Camera
} from 'lucide-react'

export default function PainelPage() {
  const supabase = createClient()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [profile, setProfile] = useState<{ nome: string; tipo_usuario: 'user' | 'provider' | 'admin' } | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [requestStats, setRequestStats] = useState({ total: 0, pendente: 0, concluido: 0 })
  const { showToast, ToastComponent } = useToast()

  // Form state para edição
  const [form, setForm] = useState<Partial<Provider>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data: providerData }] = await Promise.all([
        supabase.from('profiles').select('nome, tipo_usuario').eq('id', user.id).single(),
        supabase.from('providers').select('*').eq('profile_id', user.id).single(),
      ])

      setProfile(profileData as any)
      if (providerData) {
        setProvider(providerData as Provider)
        setForm(providerData as Provider)

        // Buscar stats de solicitações
        const { data: reqs } = await supabase
          .from('service_requests')
          .select('status')
          .eq('provider_id', providerData.id)

        if (reqs) {
          setRequestStats({
            total: reqs.length,
            pendente: reqs.filter(r => r.status === 'pendente').length,
            concluido: reqs.filter(r => r.status === 'concluido').length,
          })
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!provider) return
    setSaving(true)
    try {
      // Geocodificar se cidade/estado mudaram
      let lat = provider.latitude
      let lng = provider.longitude
      if (form.cidade !== provider.cidade || form.estado !== provider.estado) {
        const coords = await geocodeCity(form.cidade ?? '', form.estado ?? '')
        if (coords) { lat = coords.lat; lng = coords.lng }
      }

      const { error } = await supabase
        .from('providers')
        .update({
          nome: form.nome,
          telefone: form.telefone,
          whatsapp: form.whatsapp,
          cidade: form.cidade,
          estado: form.estado,
          tipos_servico: form.tipos_servico,
          atende_24h: form.atende_24h,
          atende_finais_semana: form.atende_finais_semana,
          atende_feriados: form.atende_feriados,
          atendimento_emergencial: form.atendimento_emergencial,
          horario_inicio: form.horario_inicio,
          horario_fim: form.horario_fim,
          raio_km: form.raio_km,
          descricao: form.descricao,
          pix: form.pix,
          foto_url: form.foto_url,
          latitude: lat,
          longitude: lng,
        })
        .eq('id', provider.id)

      if (error) {
        showToast('Erro ao salvar dados.', 'error')
      } else {
        setProvider({ ...provider, ...form } as Provider)
        setEditMode(false)
        showToast('Dados atualizados com sucesso!', 'success')
      }
    } finally {
      setSaving(false)
    }
  }

  function toggleServico(tipo: TipoServico) {
    const current = form.tipos_servico ?? []
    if (current.includes(tipo)) {
      setForm({ ...form, tipos_servico: current.filter(t => t !== tipo) })
    } else {
      setForm({ ...form, tipos_servico: [...current, tipo] })
    }
  }

  if (loading) return (
    <ProviderLayout nomeUsuario={profile?.nome} activeTab="painel">
      <PageSpinner />
    </ProviderLayout>
  )

  return (
    <ProviderLayout nomeUsuario={profile?.nome} activeTab="painel">
      {ToastComponent}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu Painel</h1>
          <p className="text-gray-500 mt-1">Gerencie suas informações profissionais.</p>
        </div>
        {provider && !editMode && (
          <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
            <Edit3 className="w-4 h-4" />
            Editar cadastro
          </Button>
        )}
        {editMode && (
          <div className="flex gap-2">
            <Button onClick={handleSave} loading={saving} size="sm">
              <Save className="w-4 h-4" />
              Salvar
            </Button>
            <Button onClick={() => { setEditMode(false); setForm(provider ?? {}) }} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {!provider ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Cadastro não encontrado</h3>
            <p className="text-sm text-amber-700 mt-1">
              Seus dados de prestador não foram encontrados. Entre em contato com o suporte.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status banner */}
          <div className={`rounded-2xl p-5 flex items-start gap-4 ${
            provider.status_aprovacao === 'aprovado'
              ? 'bg-green-50 border border-green-200'
              : provider.status_aprovacao === 'reprovado'
              ? 'bg-red-50 border border-red-200'
              : 'bg-amber-50 border border-amber-200'
          }`}>
            {provider.status_aprovacao === 'aprovado' ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">Status do cadastro:</span>
                <StatusBadge status={provider.status_aprovacao} />
              </div>
              <p className="text-sm text-gray-600">
                {provider.status_aprovacao === 'aprovado'
                  ? 'Seu perfil está visível para usuários na plataforma.'
                  : provider.status_aprovacao === 'reprovado'
                  ? 'Seu cadastro foi reprovado. Entre em contato com o suporte.'
                  : 'Seu cadastro está em análise. Aguarde a aprovação.'}
              </p>
            </div>
          </div>

          {/* Banner sem foto */}
          {!provider.foto_url && !editMode && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900">Seu perfil está sem foto!</h3>
                <p className="text-sm text-orange-700 mt-0.5">
                  Prestadores com foto recebem até <strong>3x mais contatos</strong>. Clientes confiam mais em quem mostra o rosto.
                </p>
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-3 inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Adicionar foto agora
                </button>
              </div>
            </div>
          )}

          {/* Mini stats */}
          {provider.status_aprovacao === 'aprovado' && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-3 sm:p-5 text-center">
                <p className="text-xl sm:text-3xl font-black text-slate-900">{requestStats.total}</p>
                <p className="text-xs text-gray-500 font-medium mt-1 flex items-center justify-center gap-1 leading-tight">
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  <span>Total</span>
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-5 text-center">
                <p className="text-xl sm:text-3xl font-black text-amber-700">{requestStats.pendente}</p>
                <p className="text-xs text-amber-600 font-medium mt-1 leading-tight">Aguardando</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-3 sm:p-5 text-center">
                <p className="text-xl sm:text-3xl font-black text-green-700">{requestStats.concluido}</p>
                <p className="text-xs text-green-600 font-medium mt-1 flex items-center justify-center gap-1 leading-tight">
                  <TrendingUp className="w-3 h-3 flex-shrink-0" />
                  <span>Feitos</span>
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dados básicos */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-500" />
                Informações básicas
              </h2>

              {editMode ? (
                <div className="space-y-3">
                  {/* Upload de foto */}
                  <div className="flex justify-center pb-2 border-b border-gray-100">
                    <PhotoUpload
                      userId={provider.profile_id}
                      currentUrl={form.foto_url}
                      onUpload={url => setForm({ ...form, foto_url: url })}
                    />
                  </div>

                  <Input
                    label="Nome"
                    value={form.nome ?? ''}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Telefone"
                      value={form.telefone ?? ''}
                      onChange={e => setForm({ ...form, telefone: e.target.value })}
                    />
                    <Input
                      label="WhatsApp"
                      value={form.whatsapp ?? ''}
                      onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                    />
                    <Input
                      label="Cidade"
                      value={form.cidade ?? ''}
                      onChange={e => setForm({ ...form, cidade: e.target.value })}
                    />
                    <Select
                      label="Estado"
                      value={form.estado ?? ''}
                      onChange={e => setForm({ ...form, estado: e.target.value })}
                      options={ESTADOS_BR.map(e => ({ value: e, label: e }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Descrição</label>
                    <textarea
                      value={form.descricao ?? ''}
                      onChange={e => setForm({ ...form, descricao: e.target.value })}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <Input
                    label="Chave Pix"
                    value={form.pix ?? ''}
                    onChange={e => setForm({ ...form, pix: e.target.value })}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <InfoRow icon={<Wrench className="w-4 h-4 text-gray-400" />} label="Nome" value={provider.nome} />
                  <InfoRow icon={<Phone className="w-4 h-4 text-gray-400" />} label="Telefone" value={provider.telefone ?? '—'} />
                  <InfoRow icon={<MessageCircle className="w-4 h-4 text-gray-400" />} label="WhatsApp" value={provider.whatsapp ?? '—'} />
                  <InfoRow icon={<MapPin className="w-4 h-4 text-gray-400" />} label="Cidade/Estado" value={`${provider.cidade}, ${provider.estado}`} />
                  {provider.descricao && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Descrição</p>
                      <p className="text-sm text-gray-700">{provider.descricao}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Serviços e disponibilidade */}
            <div className="space-y-4">
              {/* Serviços */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Tipos de serviço</h2>
                {editMode ? (
                  <div className="grid grid-cols-2 gap-2">
                    {TIPOS_SERVICO_LIST.map(tipo => {
                      const checked = (form.tipos_servico ?? []).includes(tipo)
                      return (
                        <label
                          key={tipo}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                            checked ? 'border-orange-400 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="accent-orange-500"
                            checked={checked}
                            onChange={() => toggleServico(tipo)}
                          />
                          {TIPOS_SERVICO_LABELS[tipo]}
                        </label>
                      )
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {provider.tipos_servico.map(tipo => (
                      <span key={tipo} className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        {TIPOS_SERVICO_LABELS[tipo as TipoServico] ?? tipo}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Disponibilidade */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  Disponibilidade
                </h2>
                {editMode ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'atende_24h', label: '24 horas' },
                        { key: 'atende_finais_semana', label: 'Fins de semana' },
                        { key: 'atende_feriados', label: 'Feriados' },
                        { key: 'atendimento_emergencial', label: 'Emergência' },
                      ].map(item => (
                        <label key={item.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-orange-500"
                            checked={!!(form as any)[item.key]}
                            onChange={e => setForm({ ...form, [item.key]: e.target.checked })}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="col-span-1 sm:col-span-1">
                        <Input
                          label="Início"
                          type="time"
                          value={form.horario_inicio ?? ''}
                          onChange={e => setForm({ ...form, horario_inicio: e.target.value })}
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-1">
                        <Input
                          label="Fim"
                          type="time"
                          value={form.horario_fim ?? ''}
                          onChange={e => setForm({ ...form, horario_fim: e.target.value })}
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-1">
                        <Input
                          label="Raio (km)"
                          type="number"
                          value={form.raio_km ?? 20}
                          onChange={e => setForm({ ...form, raio_km: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <BoolRow label="Atende 24h" value={provider.atende_24h} />
                    <BoolRow label="Fins de semana" value={provider.atende_finais_semana} />
                    <BoolRow label="Feriados" value={provider.atende_feriados} />
                    <BoolRow label="Atendimento emergencial" value={provider.atendimento_emergencial} />
                    {provider.horario_inicio && provider.horario_fim && (
                      <p className="text-sm text-gray-600 pt-1">
                        Horário: {provider.horario_inicio} às {provider.horario_fim}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">Raio: {provider.raio_km}km</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ProviderLayout>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  )
}

function BoolRow({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${value ? 'bg-green-100' : 'bg-gray-100'}`}>
        <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`} />
      </div>
      <span className={value ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
    </div>
  )
}
