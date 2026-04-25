'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { KeyRound, CheckCircle } from 'lucide-react'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setErro('')
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setErro('Erro ao enviar o e-mail. Verifique o endereço e tente novamente.')
      return
    }

    setEnviado(true)
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
        {enviado ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">E-mail enviado!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Verifique sua caixa de entrada e clique no link para redefinir sua senha.
            </p>
            <Link href="/login">
              <Button fullWidth>Voltar para o login</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-orange-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Esqueceu a senha?</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Digite seu e-mail e enviaremos um link para redefinir sua senha.
              </p>
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

              {erro && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {erro}
                </div>
              )}

              <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
                Enviar link de redefinição
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Lembrou a senha?{' '}
              <Link href="/login" className="text-orange-500 font-semibold hover:text-orange-600">
                Voltar ao login
              </Link>
            </p>
          </>
        )}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        <Link href="/" className="hover:text-gray-600">← Voltar para o início</Link>
      </p>
    </div>
  )
}
