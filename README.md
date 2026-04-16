# Vrum SOS — Plataforma de Assistência Automotiva

Sistema web MVP para conectar usuários que precisam de assistência automotiva com prestadores de serviço da região.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (banco de dados + autenticação)
- **React Hook Form + Zod** (validação de formulários)
- **Lucide React** (ícones)

---

## Perfis do sistema

| Perfil | Acesso |
|--------|--------|
| **Usuário** | Busca e contata prestadores |
| **Prestador** | Gerencia seu perfil profissional |
| **Admin** | Aprova prestadores e gerencia a plataforma |

---

## Configuração do projeto

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados do Supabase:

```bash
cp .env.local.example .env.local
```

No Supabase Dashboard → seu projeto → Settings → API, copie:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

### 3. Configurar o banco de dados no Supabase

1. Acesse: **Supabase Dashboard → SQL Editor → New Query**
2. Cole e execute o conteúdo de `supabase/migrations/001_initial.sql`
3. Isso criará as tabelas, triggers e políticas de segurança (RLS)

### 4. Criar o usuário admin

1. Vá em **Authentication → Users → Invite User** ou crie manualmente
2. Após criar, execute no SQL Editor:

```sql
UPDATE profiles SET tipo_usuario = 'admin' WHERE email = 'seu-admin@email.com';
```

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

---

## Estrutura do projeto

```
vrum-sos/
├── app/
│   ├── (auth)/                 # Páginas de autenticação (sem layout dashboard)
│   │   ├── login/
│   │   ├── register/
│   │   ├── provider-login/
│   │   └── provider-register/
│   ├── (user)/
│   │   └── dashboard/          # Painel do usuário + busca de prestadores
│   │       └── providers/[id]/ # Detalhe do prestador
│   ├── (provider)/
│   │   └── painel/             # Painel do prestador
│   ├── (admin)/
│   │   └── admin/              # Área administrativa
│   │       ├── prestadores/
│   │       └── usuarios/
│   ├── layout.tsx
│   ├── page.tsx                # Home page
│   └── globals.css
├── components/
│   ├── ui/                     # Componentes base reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── Toast.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── DashboardLayout.tsx
│   │   └── AdminLayout.tsx
│   └── provider/
│       ├── ProviderCard.tsx
│       └── ProviderFilters.tsx
├── hooks/
│   ├── useAuth.ts
│   └── useProviders.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase
│   │   └── server.ts           # Server-side Supabase
│   └── utils.ts
├── services/
│   ├── auth.service.ts
│   ├── provider.service.ts
│   └── request.service.ts
├── types/
│   └── index.ts                # Todos os tipos TypeScript
├── supabase/
│   └── migrations/
│       └── 001_initial.sql     # Script SQL do banco de dados
├── middleware.ts               # Proteção de rotas
└── .env.local.example
```

---

## Fluxo de cadastro de prestador

1. Prestador acessa `/provider-register` e preenche o formulário completo
2. Conta criada no Supabase Auth com `tipo_usuario = 'provider'`
3. Dados profissionais salvos na tabela `providers` com `status_aprovacao = 'pendente'`
4. Admin acessa `/admin/prestadores` e aprova ou reprova
5. Somente prestadores com `status_aprovacao = 'aprovado'` aparecem na busca de usuários

---

## Rotas da aplicação

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Home page | Público |
| `/login` | Login de usuário | Público |
| `/register` | Cadastro de usuário | Público |
| `/provider-login` | Login de prestador | Público |
| `/provider-register` | Cadastro de prestador | Público |
| `/dashboard` | Busca de prestadores | Usuário logado |
| `/dashboard/providers/[id]` | Detalhe do prestador | Usuário logado |
| `/painel` | Painel do prestador | Prestador logado |
| `/admin` | Dashboard admin | Admin |
| `/admin/prestadores` | Gerenciar prestadores | Admin |
| `/admin/usuarios` | Gerenciar usuários | Admin |

---

## Banco de dados

### Tabelas

**profiles** — Perfis de todos os usuários
- Criada automaticamente via trigger ao registrar no Supabase Auth
- Campos: `id`, `nome`, `email`, `tipo_usuario`, `created_at`

**providers** — Dados profissionais dos prestadores
- Campos completos de disponibilidade, localização, serviços, tipo (autônomo/empresa)
- `status_aprovacao`: `pendente | aprovado | reprovado`

**service_requests** — Solicitações de atendimento
- Campos: `user_id`, `provider_id`, `tipo_servico`, `cidade`, `observacao`, `status`

---

## Deploy

### Vercel (recomendado)

1. Faça push para o GitHub
2. Importe o projeto na Vercel
3. Configure as variáveis de ambiente no painel da Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático a cada push

---

## Próximas funcionalidades (roadmap)

- [ ] Upload de foto/logo do prestador (Supabase Storage)
- [ ] Sistema de avaliações e estrelas
- [ ] Notificações por e-mail ao aprovar/reprovar prestador
- [ ] Chat em tempo real entre usuário e prestador
- [ ] Painel de solicitações para o prestador
- [ ] Histórico de atendimentos do usuário
- [ ] Mapa com localização dos prestadores (Google Maps)
- [ ] PWA para acesso mobile
- [ ] Planos de destaque para prestadores

---

## Suporte

Em caso de dúvidas ou problemas, verifique:
1. As variáveis de ambiente estão corretas
2. O SQL foi executado completamente no Supabase
3. O usuário admin foi atualizado corretamente na tabela `profiles`
