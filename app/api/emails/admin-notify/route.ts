import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailTemplates } from '@/lib/email'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'gzussouza@gmail.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://vrumsos.com.br'

export async function POST(request: NextRequest) {
  try {
    const { nome, nomeEmpresa, cidade, estado, servicos } = await request.json()

    if (!nome || !cidade || !estado) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const template = emailTemplates.adminNewProvider(
      nome,
      nomeEmpresa,
      cidade,
      estado,
      servicos,
      `${APP_URL}/admin/prestadores`
    )

    await sendEmail({ to: ADMIN_EMAIL, subject: template.subject, html: template.html })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao notificar admin:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
