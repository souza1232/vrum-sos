'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { geocodeCity } from '@/lib/geocoding'
import { useEmail } from '@/hooks/useEmail'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { TIPOS_SERVICO_LIST, TIPOS_SERVICO_LABELS, ESTADOS_BR, TipoServico } from '@/types'
import { CheckCircle, Wrench, Camera, X, Upload } from 'lucide-react'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmar_senha: z.string(),
  nome: z.string().min(2, 'Nome obrigatório'),
  telefone: z.string().min(10, 'Telefone inválido'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  estado: z.string().min(2, 'Estado obrigatório'),
  tipos_servico: z.array(z.string()).min(1, 'Selecione ao menos um serviço'),
  tipo_prestador: z.enum(['autonomo', 'empresa']),
  nome_empresa: z.string().optional(),
  cnpj: z.string().optional(),
  quantidade_equipe: z.string().optional(),
  atende_multiplos_chamados: z.boolean().optional(),
  cpf: z.string().optional(),
  trabalha_sozinho: z.boolean().optional(),
  atende_24h: z.boolean(),
  atende_finais_semana: z.boolean(),
  atende_feriados: z.boolean(),
  atendimento_emergencial: z.boolean(),
  horario_inicio: z.string().optional(),
  horario_fim: z.string().optional(),
  raio_km: z.string(),
  descricao: z.string().optional(),
  pix: z.string().optional(),
}).refine(d => d.senha === d.confirmar_senha, {
  message: 'As senhas não coincidem',
  path: ['confirmar_senha'],
})

type FormData = z.infer<typeof schema>

export default function ProviderRegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const { sendProviderStatusEmail, sendAdminNotification } = useEmail()
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const [etapa, setEtapa] = useState(1)
  const [fotos, setFotos] = useState<File[]>([])
  const [fotosPreviews, setFotosPreviews] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo_prestador: 'autonomo',
      tipos_servico: [],
      atende_24h: false,
      atende_finais_semana: false,
      atende_feriados: false,
      atendimento_emergencial: false,
      raio_km: '20',
    },
  })

  const tipoPrestador = watch('tipo_prestador')

  function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const novas = [...fotos, ...files].slice(0, 3)
    setFotos(novas)
    setFotosPreviews(novas.map(f => URL.createObjectURL(f)))
  }

  function removerFoto(i: number) {
    const novas = fotos.filter((_, idx) => idx !== i)
    setFotos(novas)
    setFotosPreviews(novas.map(f => URL.createObjectURL(f)))
  }

  async function onSubmit(data: FormData) {
    setErro('')

    // 1. Criar conta auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: {
          nome: data.nome,
          tipo_usuario: 'provider',
        },
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        setErro('Este e-mail já está cadastrado.')
      } else {
        setErro('Erro ao criar conta: ' + authError.message)
      }
      return
    }

    const userId = authData.user?.id
    if (!userId) {
      setErro('Erro inesperado. Tente novamente.')
      return
    }

    // Aguardar trigger criar o profile
    await new Promise(r => setTimeout(r, 1000))

    // Geocodificar cidade para exibir no mapa
    const coords = await geocodeCity(data.cidade, data.estado)

    // Upload das fotos
    let fotoUrl: string | null = null
    if (fotos.length > 0) {
      const foto = fotos[0]
      const ext = foto.name.split('.').pop()
      const path = `${userId}/trabalho.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('provider-photos')
        .upload(path, foto, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('provider-photos').getPublicUrl(path)
        fotoUrl = urlData.publicUrl
      }
    }

    // 2. Criar registro de prestador
    const { error: providerError } = await supabase.from('providers').insert({
      profile_id: userId,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      whatsapp: data.whatsapp,
      cidade: data.cidade,
      estado: data.estado,
      tipos_servico: data.tipos_servico,
      tipo_prestador: data.tipo_prestador,
      nome_empresa: data.nome_empresa || null,
      cnpj: data.cnpj || null,
      cpf: data.cpf || null,
      trabalha_sozinho: data.trabalha_sozinho ?? true,
      quantidade_equipe: data.quantidade_equipe ? parseInt(data.quantidade_equipe) : null,
      atende_multiplos_chamados: data.atende_multiplos_chamados ?? false,
      atende_24h: data.atende_24h,
      atende_finais_semana: data.atende_finais_semana,
      atende_feriados: data.atende_feriados,
      atendimento_emergencial: data.atendimento_emergencial,
      horario_inicio: data.horario_inicio || null,
      horario_fim: data.horario_fim || null,
      raio_km: parseInt(data.raio_km) || 20,
      descricao: data.descricao || null,
      pix: data.pix || null,
      foto_url: fotoUrl,
      status_aprovacao: 'aprovado',
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
    })

    if (providerError) {
      setErro('Conta criada, mas houve erro ao salvar dados profissionais. Faça login e complete seu cadastro.')
      return
    }

    // Enviar emails em paralelo (não bloqueia se falhar)
    try {
      const servicosLabel = (data.tipos_servico as string[])
        .map(s => TIPOS_SERVICO_LABELS[s as TipoServico] ?? s)
        .join(', ')

      await Promise.allSettled([
        sendProviderStatusEmail(data.email, data.nome, 'approved', data.nome_empresa || undefined),
        sendAdminNotification({
          nome: data.nome,
          nomeEmpresa: data.nome_empresa || undefined,
          cidade: data.cidade,
          estado: data.estado,
          servicos: servicosLabel,
        }),
      ])
    } catch (emailError) {
      console.warn('Erro ao enviar emails:', emailError)
    }

    setSucesso(true)
    setTimeout(() => {
      router.push('/painel')
      router.refresh()
    }, 2000)
  }

  if (sucesso) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Cadastro aprovado!</h2>
          <p className="text-gray-500 text-sm">
            Seu perfil já está ativo na plataforma. Ative as notificações no seu painel para receber chamados SOS.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cadastro de Prestador</h1>
          <p className="text-gray-500 mt-1">Preencha seus dados profissionais. Seu perfil fica ativo na hora.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* SEÇÃO: Acesso */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Dados de acesso
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="E-mail" type="email" placeholder="seu@email.com" required error={errors.email?.message} {...register('email')} />
              <Input label="Nome completo" type="text" placeholder="Seu nome" required error={errors.nome?.message} {...register('nome')} />
              <Input label="Senha" type="password" placeholder="Mínimo 6 caracteres" required error={errors.senha?.message} {...register('senha')} />
              <Input label="Confirmar senha" type="password" placeholder="Repita a senha" required error={errors.confirmar_senha?.message} {...register('confirmar_senha')} />
            </div>
          </fieldset>

          <hr className="border-gray-100" />

          {/* SEÇÃO: Contato */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Contato e localização
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Telefone" type="tel" placeholder="(11) 99999-9999" required error={errors.telefone?.message} {...register('telefone')} />
              <Input label="WhatsApp" type="tel" placeholder="(11) 99999-9999" required error={errors.whatsapp?.message} {...register('whatsapp')} />
              <Input label="Cidade" type="text" placeholder="Sua cidade" required error={errors.cidade?.message} {...register('cidade')} />
              <Select
                label="Estado"
                required
                error={errors.estado?.message}
                placeholder="Selecione o estado"
                options={ESTADOS_BR.map(e => ({ value: e, label: e }))}
                {...register('estado')}
              />
            </div>
          </fieldset>

          <hr className="border-gray-100" />

          {/* SEÇÃO: Serviços */}
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Tipos de serviço *
            </legend>
            <Controller
              name="tipos_servico"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TIPOS_SERVICO_LIST.map(tipo => {
                    const checked = field.value.includes(tipo)
                    return (
                      <label
                        key={tipo}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                          checked
                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="accent-orange-500"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) {
                              field.onChange([...field.value, tipo])
                            } else {
                              field.onChange(field.value.filter((v: string) => v !== tipo))
                            }
                          }}
                        />
                        {TIPOS_SERVICO_LABELS[tipo as TipoServico]}
                      </label>
                    )
                  })}
                </div>
              )}
            />
            {errors.tipos_servico && (
              <p className="text-xs text-red-500">{errors.tipos_servico.message}</p>
            )}
          </fieldset>

          <hr className="border-gray-100" />

          {/* SEÇÃO: Tipo de prestador */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Tipo de prestador *
            </legend>
            <div className="flex gap-3">
              {[
                { value: 'autonomo', label: 'Autônomo' },
                { value: 'empresa', label: 'Empresa' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer text-sm font-medium transition-all ${
                    tipoPrestador === opt.value
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <input type="radio" value={opt.value} className="accent-orange-500" {...register('tipo_prestador')} />
                  {opt.label}
                </label>
              ))}
            </div>

            {tipoPrestador === 'empresa' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <Input label="Nome da empresa" type="text" placeholder="Razão social" error={errors.nome_empresa?.message} {...register('nome_empresa')} />
                <Input label="CNPJ" type="text" placeholder="00.000.000/0000-00" error={errors.cnpj?.message} {...register('cnpj')} />
                <Input label="Qtd. de veículos/equipe" type="number" min="1" error={errors.quantidade_equipe?.message} {...register('quantidade_equipe')} />
                <div className="flex items-center gap-3 pt-5">
                  <input type="checkbox" id="multiplos" className="accent-orange-500 w-5 h-5" {...register('atende_multiplos_chamados')} />
                  <label htmlFor="multiplos" className="text-sm font-medium text-gray-700">Atende múltiplos chamados?</label>
                </div>
              </div>
            )}

            {tipoPrestador === 'autonomo' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                <Input label="CPF (opcional)" type="text" placeholder="000.000.000-00" error={errors.cpf?.message} {...register('cpf')} />
                <div className="flex items-center gap-3 pt-5">
                  <input type="checkbox" id="sozinho" className="accent-orange-500 w-5 h-5" defaultChecked {...register('trabalha_sozinho')} />
                  <label htmlFor="sozinho" className="text-sm font-medium text-gray-700">Trabalha sozinho?</label>
                </div>
              </div>
            )}
          </fieldset>

          <hr className="border-gray-100" />

          {/* SEÇÃO: Disponibilidade */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Disponibilidade
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'atende_24h', label: '24 horas' },
                { id: 'atende_finais_semana', label: 'Fins de semana' },
                { id: 'atende_feriados', label: 'Feriados' },
                { id: 'atendimento_emergencial', label: 'Emergência' },
              ].map(item => (
                <label
                  key={item.id}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-white cursor-pointer text-sm font-medium text-gray-600 hover:border-gray-300"
                >
                  <input
                    type="checkbox"
                    className="accent-orange-500"
                    {...register(item.id as keyof FormData)}
                  />
                  {item.label}
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Horário início" type="time" error={errors.horario_inicio?.message} {...register('horario_inicio')} />
              <Input label="Horário fim" type="time" error={errors.horario_fim?.message} {...register('horario_fim')} />
              <Input label="Raio de atendimento (km)" type="number" min="1" max="500" defaultValue="20" error={errors.raio_km?.message} {...register('raio_km')} />
            </div>
          </fieldset>

          <hr className="border-gray-100" />

          {/* SEÇÃO: Informações extras */}
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Informações adicionais
            </legend>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Descrição do serviço</label>
              <textarea
                placeholder="Descreva brevemente seu serviço, experiência e diferenciais..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                {...register('descricao')}
              />
            </div>
            <Input label="Chave Pix" type="text" placeholder="CPF, e-mail, telefone ou chave aleatória" error={errors.pix?.message} {...register('pix')} />
          </fieldset>

          {/* SEÇÃO: Fotos */}
          <hr className="border-gray-100" />
          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Sua foto ou local de trabalho
            </legend>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-start gap-2">
              <Camera className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                <strong>Prestadores com foto recebem até 3x mais contatos.</strong> Adicione uma foto sua ou do seu local de trabalho — isso passa muito mais confiança para quem está procurando ajuda.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {fotosPreviews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removerFoto(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {fotos.length < 3 && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <span className="text-xs text-gray-400">Adicionar</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFotos} />
                </label>
              )}
            </div>
          </fieldset>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} variant="secondary">
            Criar minha conta
          </Button>

          <p className="text-xs text-gray-400 text-center">
            Seu perfil fica <strong>ativo imediatamente</strong> após o cadastro.
          </p>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Já tem cadastro?{' '}
            <Link href="/provider-login" className="text-orange-500 font-semibold hover:text-orange-600">
              Fazer login
            </Link>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        <Link href="/" className="hover:text-gray-600">← Voltar para o início</Link>
      </p>
    </div>
  )
}
