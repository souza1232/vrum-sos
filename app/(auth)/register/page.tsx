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
import { UserPlus } from 'lucide-react'

const schema = z
  .object({
    nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
    confirmar_senha: z.string(),
  })
  .refine(d => d.senha === d.confirmar_senha, {
    message: 'As senhas não coincidem',
    path: ['confirmar_senha'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setErro('')
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: {
          nome: data.nome,
          tipo_usuario: 'user',
        },
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setErro('Este e-mail já está cadastrado. Tente fazer login.')
      } else {
        setErro('Erro ao criar conta. Tente novamente.')
      }
      return
    }

    setSucesso(true)
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 1500)
  }

  if (sucesso) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Conta criada!</h2>
          <p className="text-gray-500">Redirecionando para o seu painel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Criar conta gratuita</h1>
          <p className="text-gray-500 mt-1">Encontre prestadores na sua região.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome completo"
            type="text"
            placeholder="Seu nome"
            required
            error={errors.nome?.message}
            {...register('nome')}
          />
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
            placeholder="Mínimo 6 caracteres"
            required
            error={errors.senha?.message}
            {...register('senha')}
          />
          <Input
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
            required
            error={errors.confirmar_senha?.message}
            {...register('confirmar_senha')}
          />

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Criar conta
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600">
              Fazer login
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            Quer oferecer serviços?{' '}
            <Link href="/provider-register" className="text-orange-500 font-semibold hover:text-orange-600">
              Cadastre-se como prestador
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
