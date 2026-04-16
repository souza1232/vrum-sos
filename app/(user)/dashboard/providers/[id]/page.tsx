'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Provider, TIPOS_SERVICO_LABELS, TipoServico } from '@/types'
import UserLayout from '@/components/layout/UserLayout'
import { PageSpinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import ReviewList from '@/components/provider/ReviewList'
import ProviderMapWrapper from '@/components/map/ProviderMapWrapper'
import { whatsappLink, formatPhone } from '@/lib/utils'
import { StarDisplay } from '@/components/ui/StarRating'
import {
  MapPin, Phone, MessageCircle, Clock, Zap, Building2, User,
  ChevronLeft, Check, Send, AlertTriangle, Map, Star
} from 'lucide-react'
import Button from '@/components/ui/Button'

export default function ProviderDetailPage() {
  const params = useParams()
  const supabase = createClient()
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<{ nome: string; tipo_usuario: 'user' | 'provider' | 'admin'; id: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [observacao, setObservacao] = useState('')
  const [avgRating, setAvgRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [activeTab, setActiveTab] = useState<'info' | 'reviews' | 'map'>('info')
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: profileData }, { data: providerData }] = await Promise.all([
        supabase.from('profiles').select('nome, tipo_usuario, id').eq('id', user.id).single(),
        supabase.from('providers').select('*').eq('id', params.id as string).eq('status_aprovacao', 'aprovado').single(),
      ])

      setProfile(profileData as any)
      if (providerData) {
        setProvider(providerData as Provider)

        // Buscar média de avaliações
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')
          .eq('provider_id', providerData.id)

        if (reviews && reviews.length > 0) {
          const avg = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          setAvgRating(avg)
          setTotalReviews(reviews.length)
        }
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  async function handleSolicitar() {
    if (!profile || !provider) return
    setSending(true)
    try {
      const { error } = await supabase.from('service_requests').insert({
        user_id: profile.id,
        provider_id: provider.id,
        tipo_servico: provider.tipos_servico[0] ?? 'mecanico',
        cidade: provider.cidade,
        observacao: observacao || null,
        status: 'pendente',
      })

      if (error) {
        showToast('Erro ao enviar solicitação.', 'error')
      } else {
        showToast('Solicitação enviada com sucesso!', 'success')
        setObservacao('')
      }
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome}>
      <PageSpinner />
    </UserLayout>
  )

  if (!provider) return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome}>
      <div className="text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="font-bold text-slate-900 text-xl mb-2">Prestador não encontrado</h2>
        <Link href="/dashboard"><Button>Voltar ao painel</Button></Link>
      </div>
    </UserLayout>
  )

  const wLink = provider.whatsapp
    ? whatsappLink(provider.whatsapp, `Olá ${provider.nome}, vi seu perfil no Vrum SOS e preciso de ajuda!`)
    : null

  const hasCoords = !!(provider.latitude && provider.longitude)

  return (
    <UserLayout tipoUsuario={profile?.tipo_usuario} nomeUsuario={profile?.nome}>
      {ToastComponent}

      <div className="mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Voltar para a listagem
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card do prestador */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-6">
              <div className="flex items-start gap-4">
                {/* Foto */}
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-orange-500 flex items-center justify-center relative">
                  {provider.foto_url ? (
                    <Image src={provider.foto_url} alt={provider.nome} fill className="object-cover" unoptimized />
                  ) : (
                    <span className="text-white font-black text-3xl">{provider.nome.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-white">{provider.nome}</h1>
                  {provider.nome_empresa && <p className="text-gray-300 text-sm mt-0.5">{provider.nome_empresa}</p>}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      {provider.tipo_prestador === 'empresa' ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                      {provider.tipo_prestador === 'empresa' ? 'Empresa' : 'Autônomo'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5" />{provider.cidade}, {provider.estado}
                    </span>
                    {avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-amber-300 text-xs font-semibold">{avgRating.toFixed(1)}</span>
                        <span className="text-gray-500 text-xs">({totalReviews})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Abas */}
            <div className="flex border-b border-gray-100">
              {[
                { id: 'info', label: 'Informações' },
                { id: 'reviews', label: `Avaliações${totalReviews > 0 ? ` (${totalReviews})` : ''}` },
                ...(hasCoords ? [{ id: 'map', label: 'Localização' }] : []),
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-orange-500 text-orange-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-6 py-5">
              {/* Tab: Informações */}
              {activeTab === 'info' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Serviços</h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.tipos_servico.map(tipo => (
                        <span key={tipo} className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                          {TIPOS_SERVICO_LABELS[tipo as TipoServico] ?? tipo}
                        </span>
                      ))}
                    </div>
                  </div>

                  {provider.descricao && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sobre</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{provider.descricao}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Disponibilidade</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Atende 24h', value: provider.atende_24h },
                        { label: 'Fins de semana', value: provider.atende_finais_semana },
                        { label: 'Feriados', value: provider.atende_feriados },
                        { label: 'Emergências', value: provider.atendimento_emergencial },
                      ].map(item => (
                        <div key={item.label} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${item.value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                          <Check className={`w-4 h-4 ${item.value ? 'text-green-500' : 'text-gray-300'}`} />
                          {item.label}
                        </div>
                      ))}
                    </div>
                    {provider.horario_inicio && provider.horario_fim && (
                      <p className="text-sm text-gray-600 mt-2 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-orange-400" />
                        Horário: {provider.horario_inicio} às {provider.horario_fim}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-orange-400" />
                      Raio de atendimento: {provider.raio_km}km
                    </p>
                  </div>
                </div>
              )}

              {/* Tab: Avaliações */}
              {activeTab === 'reviews' && (
                <ReviewList
                  providerId={provider.id}
                  currentUserId={profile?.id}
                />
              )}

              {/* Tab: Mapa */}
              {activeTab === 'map' && hasCoords && (
                <div>
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-orange-400" />
                    Localização aproximada · raio de {provider.raio_km}km
                  </p>
                  <ProviderMapWrapper
                    providers={[provider]}
                    highlightId={provider.id}
                    center={[provider.latitude!, provider.longitude!]}
                    zoom={12}
                    showRadius
                    className="h-80 rounded-xl overflow-hidden"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          {/* Contato */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Contato direto</h3>
            {provider.telefone && (
              <a href={`tel:${provider.telefone}`} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Telefone</p>
                  <p className="text-sm font-medium text-gray-900">{formatPhone(provider.telefone)}</p>
                </div>
              </a>
            )}
            {wLink && (
              <a href={wLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600">WhatsApp</p>
                  <p className="text-sm font-medium text-green-800">{formatPhone(provider.whatsapp ?? '')}</p>
                </div>
              </a>
            )}
          </div>

          {/* Solicitar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />Solicitar atendimento
            </h3>
            <textarea
              value={observacao}
              onChange={e => setObservacao(e.target.value)}
              placeholder="Descreva o problema (opcional)..."
              rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
            <Button fullWidth onClick={handleSolicitar} loading={sending}>
              <Send className="w-4 h-4" />
              Solicitar atendimento
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  )
}
