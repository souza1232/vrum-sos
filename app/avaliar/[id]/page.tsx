'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Zap, Star, CheckCircle, MapPin, Clock } from 'lucide-react'

const COOLDOWN_DIAS = 30
const storageKey = (id: string) => `vrum_reviewed_${id}`

export default function AvaliarPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [provider, setProvider] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [nome, setNome] = useState('')
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [jaAvaliou, setJaAvaliou] = useState(false)

  useEffect(() => {
    const ts = localStorage.getItem(storageKey(params.id))
    if (ts) {
      const diasPassados = (Date.now() - parseInt(ts)) / (1000 * 60 * 60 * 24)
      if (diasPassados < COOLDOWN_DIAS) setJaAvaliou(true)
    }
    supabase
      .from('providers')
      .select('id, nome, nome_empresa, cidade, estado, foto_url, tipos_servico')
      .eq('id', params.id)
      .eq('status_aprovacao', 'aprovado')
      .single()
      .then(({ data }) => setProvider(data))
  }, [params.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) {
      setErro('Selecione quantas estrelas merece o atendimento.')
      return
    }
    setErro('')
    setLoading(true)
    const { error } = await supabase.from('reviews').insert({
      provider_id: params.id,
      user_id: null,
      avaliador_nome: nome.trim() || null,
      rating,
      comentario: comentario.trim() || null,
    })
    setLoading(false)
    if (error) {
      setErro('Erro ao enviar. Tente novamente.')
    } else {
      localStorage.setItem(storageKey(params.id), Date.now().toString())
      setEnviado(true)
    }
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Vrum <span className="text-orange-400">SOS</span></span>
          </Link>
        </div>
      </nav>

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-10">

        {jaAvaliou && !enviado ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Você já avaliou este prestador</h2>
            <p className="text-gray-500 text-sm mb-6">
              É possível avaliar novamente após {COOLDOWN_DIAS} dias. Isso garante avaliações mais confiáveis para todos.
            </p>
            <div className="flex gap-3">
              <Link href="/buscar" className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                Buscar prestadores
              </Link>
              <Link href={`/prestador/${params.id}`} className="flex-1 text-center border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors">
                Ver perfil
              </Link>
            </div>
          </div>
        ) : enviado ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Avaliação enviada!</h2>
            <p className="text-gray-500 text-sm mb-6">Obrigado por ajudar outros motoristas a encontrar bons profissionais.</p>
            <div className="flex gap-3">
              <Link href="/buscar" className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                Buscar prestadores
              </Link>
              <Link href={`/prestador/${params.id}`} className="flex-1 text-center border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl text-sm transition-colors">
                Ver perfil
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Card do prestador */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-500 flex items-center justify-center relative">
                {provider.foto_url ? (
                  <Image src={provider.foto_url} alt={provider.nome} fill className="object-cover" unoptimized />
                ) : (
                  <span className="text-white font-black text-xl">{provider.nome.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">{provider.nome}</p>
                {provider.nome_empresa && <p className="text-sm text-gray-500">{provider.nome_empresa}</p>}
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />{provider.cidade}, {provider.estado}
                </p>
              </div>
            </div>

            {/* Formulário */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h1 className="text-xl font-black text-slate-900 mb-1">Como foi o atendimento?</h1>
              <p className="text-sm text-gray-500 mb-6">Sua avaliação ajuda outros motoristas a escolher bem.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Estrelas */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-3">Nota</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-9 h-9 transition-colors ${
                            s <= (hover || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200 fill-gray-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {['', 'Péssimo', 'Ruim', 'Regular', 'Bom', 'Excelente'][rating]}
                    </p>
                  )}
                  {erro && <p className="text-xs text-red-500 mt-1">{erro}</p>}
                </div>

                {/* Nome */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Seu nome <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    placeholder="Ex: João Silva"
                    maxLength={60}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Comentário */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Comentário <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    placeholder="Conte como foi o atendimento, prazo, preço..."
                    rows={3}
                    maxLength={500}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 text-right mt-0.5">{comentario.length}/500</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  {loading ? 'Enviando...' : 'Enviar avaliação'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
