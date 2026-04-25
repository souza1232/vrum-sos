import Link from 'next/link'
import { Zap } from 'lucide-react'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Termos de Uso — Vrum SOS',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">
              Vrum <span className="text-orange-400">SOS</span>
            </span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: abril de 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-gray-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Aceitação dos Termos</h2>
            <p>Ao acessar ou utilizar o Vrum SOS, você concorda com estes Termos de Uso. Se não concordar com qualquer parte destes termos, não utilize a plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Sobre a Plataforma</h2>
            <p>O Vrum SOS é uma plataforma de conexão entre usuários e prestadores de serviços automotivos (mecânicos, guincheiros, borracheiros, chaveiros, eletricistas automotivos, entre outros). A plataforma atua como intermediária e não é responsável pela execução dos serviços prestados.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Cadastro e Conta</h2>
            <p>Para utilizar os serviços, você deve criar uma conta com informações verdadeiras e atualizadas. Você é responsável pela segurança de sua conta e senha. Não é permitido criar contas com dados falsos ou de terceiros.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Responsabilidades dos Usuários</h2>
            <p>Os usuários comprometem-se a utilizar a plataforma apenas para fins lícitos, não praticar atos que prejudiquem outros usuários ou prestadores, e fornecer informações corretas ao solicitar serviços.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Responsabilidades dos Prestadores</h2>
            <p>Os prestadores cadastrados são responsáveis pela qualidade e legalidade dos serviços oferecidos. O Vrum SOS realiza uma análise de aprovação antes de tornar os perfis visíveis, mas não garante a qualidade do serviço executado. Prestadores devem manter seus dados sempre atualizados.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Limitação de Responsabilidade</h2>
            <p>O Vrum SOS não se responsabiliza por danos decorrentes de serviços prestados por terceiros cadastrados na plataforma, por falhas de comunicação entre usuários e prestadores, ou por quaisquer acordos financeiros realizados fora da plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Suspensão e Cancelamento</h2>
            <p>Reservamos o direito de suspender ou cancelar contas que violem estes termos, sem aviso prévio, a nosso critério exclusivo.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Alterações nos Termos</h2>
            <p>Estes termos podem ser atualizados a qualquer momento. O uso continuado da plataforma após alterações implica na aceitação dos novos termos.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Contato</h2>
            <p>Para dúvidas sobre estes termos, entre em contato pelo e-mail: <a href="mailto:contato@vrumsos.com.br" className="text-orange-500 hover:underline">contato@vrumsos.com.br</a></p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex gap-4 text-sm">
          <Link href="/privacidade" className="text-orange-500 hover:underline">Política de Privacidade</Link>
          <Link href="/" className="text-gray-400 hover:text-gray-600">← Voltar ao início</Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
