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
import { LockKeyhole } from 'lucide-react'

const schema = z.object({
  senha: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  confirmar: z.string().min(6, 'Confirme sua senha'),
}).refine(data => data.senha === data.confirmar, {
  message: 'As senhas não coincidem',
  path: ['confirmar'],
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
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
    const { error } = await supabase.auth.updateUser({ password: data.senha })

    if (error) {
      setErro('Erro ao redefinir a senha. O link pode ter expirado. Tente novamente.')
      return
    }

    router.push('/login?msg=senha_redefinida')
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-8">
        <div className="mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
            <LockKeyhole className="w-6 h-6 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Nova senha</h1>
          <p className="text-gray-500 mt-1 text-sm">Digite sua nova senha abaixo.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 6 caracteres"
            required
            error={errors.senha?.message}
            {...register('senha')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a nova senha"
            required
            error={errors.confirmar?.message}
            {...register('confirmar')}
          />

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {erro}
            </div>
          )}

          <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
            Salvar nova senha
          </Button>
        </form>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        <Link href="/login" className="hover:text-gray-600">← Voltar ao login</Link>
      </p>
    </div>
  )
}
