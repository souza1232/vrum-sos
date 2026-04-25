import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY não está definido nas variáveis de ambiente')
}

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailData {
  to: string
  subject: string
  html: string
}

export const sendEmail = async ({ to, subject, html }: EmailData) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@vrumsos.com.br',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      throw new Error(error.message)
    }

    return data
  } catch (error) {
    console.error('Erro no serviço de email:', error)
    throw error
  }
}

// Templates de email
export const emailTemplates = {
  welcomeUser: (nome: string) => ({
    subject: 'Bem-vindo ao Vrum SOS! 🚗',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #f97316; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">V</span>
          </div>
          <h1 style="color: #1e293b; margin: 0;">Vrum SOS</h1>
        </div>

        <h2 style="color: #1e293b; margin-bottom: 20px;">Olá, ${nome}! 👋</h2>

        <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
          Seja muito bem-vindo(a) ao Vrum SOS! Agora você tem acesso à maior rede de prestadores de serviços automotivos do Brasil.
        </p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0;">
          <h3 style="color: #1e293b; margin-bottom: 15px;">O que você pode fazer agora:</h3>
          <ul style="color: #64748b; line-height: 1.6; padding-left: 20px;">
            <li>Buscar mecânicos, guinchos, borracheiros e muito mais</li>
            <li>Filtrar por cidade e tipo de serviço</li>
            <li>Ver prestadores no mapa</li>
            <li>Entrar em contato via WhatsApp</li>
            <li>Salvar seus prestadores favoritos</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vrumsos.com.br'}/dashboard"
             style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Acessar Dashboard
          </a>
        </div>

        <hr style="border: none; height: 1px; background: #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 14px; text-align: center;">
          Se você não se cadastrou no Vrum SOS, pode ignorar este email.
        </p>
      </div>
    `
  }),

  providerPending: (nome: string, nomeEmpresa?: string) => ({
    subject: 'Cadastro recebido - Em análise 📋',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #f97316; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">V</span>
          </div>
          <h1 style="color: #1e293b; margin: 0;">Vrum SOS</h1>
        </div>

        <h2 style="color: #1e293b; margin-bottom: 20px;">Olá, ${nome}! 📋</h2>

        <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
          Recebemos seu cadastro como prestador de serviços${nomeEmpresa ? ` (${nomeEmpresa})` : ''} e nossa equipe já iniciou a análise.
        </p>

        <div style="background: #fff7ed; border-left: 4px solid #f97316; padding: 20px; margin: 25px 0;">
          <h3 style="color: #ea580c; margin: 0 0 10px 0;">⏰ Próximos passos:</h3>
          <ul style="color: #9a3412; line-height: 1.6; margin: 0; padding-left: 20px;">
            <li>Nossa equipe analisará suas informações</li>
            <li>Você receberá um email de aprovação em até 24h</li>
            <li>Após aprovado, aparecerá nas buscas dos usuários</li>
          </ul>
        </div>

        <p style="color: #64748b; line-height: 1.6;">
          Enquanto isso, você pode acessar seu painel para completar informações adicionais.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vrumsos.com.br'}/painel"
             style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Acessar Meu Painel
          </a>
        </div>

        <hr style="border: none; height: 1px; background: #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 14px; text-align: center;">
          Em caso de dúvidas, entre em contato conosco.
        </p>
      </div>
    `
  }),

  providerApproved: (nome: string) => ({
    subject: '✅ Parabéns! Você foi aprovado no Vrum SOS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #f97316; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">V</span>
          </div>
          <h1 style="color: #1e293b; margin: 0;">Vrum SOS</h1>
        </div>

        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎉 APROVADO!</h2>
          <p style="margin: 0; opacity: 0.9;">Parabéns, ${nome}! Seu cadastro foi aprovado.</p>
        </div>

        <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
          Excelente notícia! Sua conta foi aprovada e agora você está visível para todos os usuários da plataforma.
        </p>

        <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 25px 0;">
          <h3 style="color: #166534; margin-bottom: 15px;">✨ Agora você pode:</h3>
          <ul style="color: #166534; line-height: 1.6; padding-left: 20px;">
            <li>Aparecer nas buscas dos usuários</li>
            <li>Receber solicitações de atendimento</li>
            <li>Gerenciar seus chamados no painel</li>
            <li>Atualizar suas informações a qualquer momento</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vrumsos.com.br'}/painel"
             style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Acessar Meu Painel
          </a>
        </div>

        <hr style="border: none; height: 1px; background: #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 14px; text-align: center;">
          Desejamos muito sucesso em sua jornada conosco! 🚗⚡
        </p>
      </div>
    `
  }),

  serviceRequest: (prestadorNome: string, usuarioNome: string, tipoServico: string, cidade: string, observacao?: string) => ({
    subject: '🚗 Nova solicitação de atendimento - Vrum SOS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background: #f97316; width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">V</span>
          </div>
          <h1 style="color: #1e293b; margin: 0;">Vrum SOS</h1>
        </div>

        <div style="background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">🚗 Nova Solicitação</h2>
          <p style="margin: 0; opacity: 0.9;">Você tem um novo chamado!</p>
        </div>

        <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">
          Olá, <strong>${prestadorNome}</strong>! Você recebeu uma nova solicitação de atendimento.
        </p>

        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0;">
          <h3 style="color: #1e293b; margin-bottom: 15px;">📋 Detalhes do atendimento:</h3>
          <div style="color: #64748b; line-height: 1.6;">
            <p><strong>Cliente:</strong> ${usuarioNome}</p>
            <p><strong>Serviço:</strong> ${tipoServico}</p>
            <p><strong>Cidade:</strong> ${cidade}</p>
            ${observacao ? `<p><strong>Observação:</strong> ${observacao}</p>` : ''}
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://vrumsos.com.br'}/painel/solicitacoes"
             style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
            Ver Solicitação
          </a>
        </div>

        <hr style="border: none; height: 1px; background: #e2e8f0; margin: 30px 0;">

        <p style="color: #94a3b8; font-size: 14px; text-align: center;">
          Responda rapidamente para aumentar suas chances de fechar o negócio! ⚡
        </p>
      </div>
    `
  })
}