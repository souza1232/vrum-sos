import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { email, nome } = await request.json()

    if (!email || !nome) {
      return NextResponse.json({ error: 'Email e nome são obrigatórios' }, { status: 400 })
    }

    const template = emailTemplates.welcomeUser(nome)

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    })

    return NextResponse.json({
      success: true,
      messageId: result?.id
    })

  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}