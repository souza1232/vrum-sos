import Link from 'next/link'
import { Zap } from 'lucide-react'
import Footer from '@/components/layout/Footer'

export const metadata = {
  title: 'Política de Privacidade — Vrum SOS',
}

export default function PrivacidadePage() {
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-400 mb-10">Última atualização: abril de 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-gray-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Introdução</h2>
            <p>O Vrum SOS respeita sua privacidade e está comprometido com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Dados Coletados</h2>
            <p>Coletamos os seguintes dados ao utilizar nossa plataforma:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nome completo e e-mail (no cadastro)</li>
              <li>Cidade e estado (para filtragem de prestadores)</li>
              <li>Dados dos prestadores: telefone, WhatsApp, localização aproximada, foto e descrição dos serviços</li>
              <li>Histórico de solicitações de serviço realizadas na plataforma</li>
              <li>Avaliações deixadas por usuários</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">3. Finalidade do Uso dos Dados</h2>
            <p>Seus dados são utilizados para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Criar e gerenciar sua conta na plataforma</li>
              <li>Conectar usuários com prestadores de serviço</li>
              <li>Enviar notificações relacionadas às suas solicitações</li>
              <li>Melhorar a experiência na plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Compartilhamento de Dados</h2>
            <p>Não vendemos seus dados a terceiros. Seus dados podem ser compartilhados apenas com os prestadores de serviço que você escolher contatar, e com provedores de tecnologia necessários para o funcionamento da plataforma (como Supabase para banco de dados e autenticação).</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Armazenamento e Segurança</h2>
            <p>Seus dados são armazenados de forma segura utilizando infraestrutura em nuvem com criptografia. Adotamos medidas técnicas e organizacionais para proteger suas informações contra acesso não autorizado.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Seus Direitos (LGPD)</h2>
            <p>Conforme a LGPD, você tem direito a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Confirmar a existência de tratamento dos seus dados</li>
              <li>Acessar os dados que temos sobre você</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
            <p className="mt-2">Para exercer esses direitos, entre em contato pelo e-mail: <a href="mailto:contato@vrumsos.com.br" className="text-orange-500 hover:underline">contato@vrumsos.com.br</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Cookies</h2>
            <p>Utilizamos cookies essenciais para manter sua sessão ativa na plataforma. Não utilizamos cookies de rastreamento ou publicidade de terceiros.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Contato</h2>
            <p>Para dúvidas sobre esta política ou para exercer seus direitos, entre em contato: <a href="mailto:contato@vrumsos.com.br" className="text-orange-500 hover:underline">contato@vrumsos.com.br</a></p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex gap-4 text-sm">
          <Link href="/termos" className="text-orange-500 hover:underline">Termos de Uso</Link>
          <Link href="/" className="text-gray-400 hover:text-gray-600">← Voltar ao início</Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
