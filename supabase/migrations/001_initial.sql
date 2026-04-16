-- =============================================================
-- Vrum SOS - Migration inicial do banco de dados
-- Execute no Supabase: SQL Editor → New Query → Cole e execute
-- =============================================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABELA: profiles
-- Estende auth.users com dados do perfil
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome        TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  tipo_usuario TEXT NOT NULL DEFAULT 'user'
                CHECK (tipo_usuario IN ('user', 'provider', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABELA: providers
-- Dados completos do prestador de serviço
-- =============================================================
CREATE TABLE IF NOT EXISTS public.providers (
  id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id              UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  -- Dados básicos
  nome                    TEXT NOT NULL,
  email                   TEXT NOT NULL,
  telefone                TEXT,
  whatsapp                TEXT,
  cidade                  TEXT NOT NULL,
  estado                  TEXT NOT NULL,

  -- Serviços
  tipos_servico           TEXT[] NOT NULL DEFAULT '{}',

  -- Tipo de prestador
  tipo_prestador          TEXT NOT NULL DEFAULT 'autonomo'
                            CHECK (tipo_prestador IN ('autonomo', 'empresa')),

  -- Empresa
  nome_empresa            TEXT,
  cnpj                    TEXT,
  quantidade_equipe       INTEGER,
  atende_multiplos_chamados BOOLEAN DEFAULT FALSE,

  -- Autônomo
  cpf                     TEXT,
  trabalha_sozinho        BOOLEAN DEFAULT TRUE,

  -- Disponibilidade
  atende_24h              BOOLEAN DEFAULT FALSE,
  atende_finais_semana    BOOLEAN DEFAULT FALSE,
  atende_feriados         BOOLEAN DEFAULT FALSE,
  atendimento_emergencial BOOLEAN DEFAULT FALSE,
  horario_inicio          TIME,
  horario_fim             TIME,
  raio_km                 INTEGER DEFAULT 20,

  -- Outras informações
  descricao               TEXT,
  pix                     TEXT,
  foto_url                TEXT,

  -- Status e controle
  status_aprovacao        TEXT NOT NULL DEFAULT 'pendente'
                            CHECK (status_aprovacao IN ('pendente', 'aprovado', 'reprovado')),
  ativo                   BOOLEAN DEFAULT TRUE,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TABELA: service_requests
-- Solicitações de atendimento
-- =============================================================
CREATE TABLE IF NOT EXISTS public.service_requests (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) NOT NULL,
  provider_id  UUID REFERENCES public.providers(id) NOT NULL,
  tipo_servico TEXT NOT NULL,
  cidade       TEXT NOT NULL,
  observacao   TEXT,
  status       TEXT NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- TRIGGER: criar profile automaticamente ao registrar
-- =============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'tipo_usuario', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- PROFILES -------------------------------------------------------
-- Usuário vê próprio perfil
CREATE POLICY "Perfil próprio - leitura"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuário atualiza próprio perfil
CREATE POLICY "Perfil próprio - atualização"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin acessa tudo
CREATE POLICY "Admin - perfis"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.tipo_usuario = 'admin'
    )
  );

-- PROVIDERS -------------------------------------------------------
-- Usuários autenticados veem prestadores aprovados
CREATE POLICY "Leitura - prestadores aprovados"
  ON public.providers FOR SELECT
  USING (status_aprovacao = 'aprovado' AND ativo = TRUE);

-- Prestador vê seu próprio cadastro (mesmo pendente/reprovado)
CREATE POLICY "Prestador - leitura própria"
  ON public.providers FOR SELECT
  USING (profile_id = auth.uid());

-- Prestador insere seu cadastro
CREATE POLICY "Prestador - inserção"
  ON public.providers FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Prestador atualiza seu cadastro
CREATE POLICY "Prestador - atualização"
  ON public.providers FOR UPDATE
  USING (profile_id = auth.uid());

-- Admin acessa tudo
CREATE POLICY "Admin - prestadores"
  ON public.providers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.tipo_usuario = 'admin'
    )
  );

-- SERVICE REQUESTS -----------------------------------------------
-- Usuário vê suas próprias solicitações
CREATE POLICY "Solicitações - leitura usuário"
  ON public.service_requests FOR SELECT
  USING (user_id = auth.uid());

-- Usuário cria solicitação
CREATE POLICY "Solicitações - inserção"
  ON public.service_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Prestador vê solicitações para ele
CREATE POLICY "Solicitações - leitura prestador"
  ON public.service_requests FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE profile_id = auth.uid()
    )
  );

-- Admin acessa tudo
CREATE POLICY "Admin - solicitações"
  ON public.service_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.tipo_usuario = 'admin'
    )
  );

-- =============================================================
-- ÍNDICES para performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_providers_status   ON public.providers(status_aprovacao);
CREATE INDEX IF NOT EXISTS idx_providers_cidade    ON public.providers(cidade);
CREATE INDEX IF NOT EXISTS idx_providers_profile   ON public.providers(profile_id);
CREATE INDEX IF NOT EXISTS idx_requests_user       ON public.service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_provider   ON public.service_requests(provider_id);

-- =============================================================
-- ADMIN PADRÃO - Execute manualmente após criar o usuário admin
-- Substitua o UUID pelo ID real do usuário criado no Supabase Auth
-- =============================================================
-- UPDATE public.profiles SET tipo_usuario = 'admin' WHERE email = 'admin@vrumsos.com.br';
