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

    const {
      prestadorEmail,
      prestadorNome,
      usuarioNome,
      tipoServico,
      cidade,
      observacao
    } = await request.json()

    if (!prestadorEmail || !prestadorNome || !usuarioNome || !tipoServico || !cidade) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios exceto observação' },
        { status: 400 }
      )
    }

    const template = emailTemplates.serviceRequest(
      prestadorNome,
      usuarioNome,
      tipoServico,
      cidade,
      observacao
    )

    const result = await sendEmail({
      to: prestadorEmail,
      subject: template.subject,
      html: template.html
    })

    return NextResponse.json({
      success: true,
      messageId: result?.id
    })

  } catch (error) {
    console.error('Erro ao enviar email de solicitação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}