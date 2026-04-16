'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Wrench } from 'lucide-react'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function ProviderLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [erro, setErro] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setErro('')
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.senha,
    })

    if (error) {
      setErro('E-mail ou senha inválidos.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    if (profile?.tipo_usuario !== 'provider' && profile?.tipo_usuario !== 'admin') {
      setErro('Esta conta não é de prestador. Use a área de usuário para entrar.')
      await supabase.auth.signOut()
      return
    }

    router.push(profile.tipo_usuario === 'admin' ? '/admin' : '/painel')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Área do Prestador</h1>
          <p className="text-gray-500 mt-1">Entre com sua conta profissional.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="E-mail"
            type="email"
            placeholder="seu@email.com"
            required
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Senha"
            type="password"
            placeholder="Sua senha"
            required
            error={errors.senha?.message}
            {...register('senha')}
          />

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting} variant="secondary">
            Entrar como prestador
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Ainda não é prestador?{' '}
            <Link href="/provider-register" className="text-orange-500 font-semibold hover:text-orange-600">
              Cadastrar agora
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            É usuário?{' '}
            <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600">
              Entrar como usuário
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
