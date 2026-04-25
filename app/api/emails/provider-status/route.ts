import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verificar autenticação e se é admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    if (profile?.tipo_usuario !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { email, nome, status, nomeEmpresa } = await request.json()

    if (!email || !nome || !status) {
      return NextResponse.json(
        { error: 'Email, nome e status são obrigatórios' },
        { status: 400 }
      )
    }

    let template

    if (status === 'pending') {
      template = emailTemplates.providerPending(nome, nomeEmpresa)
    } else if (status === 'approved') {
      template = emailTemplates.providerApproved(nome)
    } else {
      return NextResponse.json(
        { error: 'Status inválido. Use: pending, approved' },
        { status: 400 }
      )
    }

    const result = await sendEmail({
      to: email,
      subject: template.subject,
      html: template.html
    })

    return NextResponse.json({
      success: true,
      messageId: result?.id,
      status
    })

  } catch (error) {
    console.error('Erro ao enviar email de status do prestador:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}