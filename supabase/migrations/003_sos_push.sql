-- =============================================================
-- Vrum SOS - Migration 003
-- SOS Público + Push Subscriptions
-- Execute no Supabase: SQL Editor → New Query → Cole e execute
-- =============================================================

-- ── 1. Ajustes em service_requests para suportar SOS público ───
ALTER TABLE public.service_requests
  ALTER COLUMN user_id     DROP NOT NULL,
  ALTER COLUMN provider_id DROP NOT NULL;

ALTER TABLE public.service_requests
  ADD COLUMN IF NOT EXISTS nome_cliente          TEXT,
  ADD COLUMN IF NOT EXISTS telefone_cliente      TEXT,
  ADD COLUMN IF NOT EXISTS assigned_provider_id  UUID REFERENCES public.providers(id);

-- ── 2. Adicionar 'avaliacao' ao tipo de notificação ────────────
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_tipo_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_tipo_check
  CHECK (tipo IN ('info', 'request', 'approval', 'status', 'avaliacao'));

-- ── 3. Atualizar RLS de service_requests ───────────────────────

-- Remove política de inserção antiga (exigia user_id autenticado)
DROP POLICY IF EXISTS "Solicitações - inserção" ON public.service_requests;

-- Inserção pública (SOS sem login) e autenticada
CREATE POLICY "Solicitações - inserção pública e autenticada"
  ON public.service_requests FOR INSERT
  WITH CHECK (
    user_id IS NULL OR
    user_id = auth.uid()
  );

-- Leitura pública de chamados SOS (para tracking em tempo real na página /socorro)
CREATE POLICY "SOS público - leitura"
  ON public.service_requests FOR SELECT
  USING (user_id IS NULL);

-- Prestador vê chamados SOS públicos pendentes (para painel/solicitacoes)
CREATE POLICY "Prestador - leitura SOS públicos"
  ON public.service_requests FOR SELECT
  USING (
    provider_id IS NULL AND
    EXISTS (
      SELECT 1 FROM public.providers
      WHERE profile_id = auth.uid()
        AND status_aprovacao = 'aprovado'
    )
  );

-- Prestador aceita chamado SOS público (define assigned_provider_id)
CREATE POLICY "Prestador - aceitar SOS"
  ON public.service_requests FOR UPDATE
  USING (
    provider_id IS NULL AND
    assigned_provider_id IS NULL
  )
  WITH CHECK (
    assigned_provider_id IN (
      SELECT id FROM public.providers WHERE profile_id = auth.uid()
    )
  );

-- Prestador atualiza status de solicitação direta a ele
CREATE POLICY "Prestador - atualizar solicitação direta"
  ON public.service_requests FOR UPDATE
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE profile_id = auth.uid()
    )
  );

-- Prestador atualiza status de SOS que já aceitou
CREATE POLICY "Prestador - atualizar SOS aceito"
  ON public.service_requests FOR UPDATE
  USING (
    assigned_provider_id IN (
      SELECT id FROM public.providers WHERE profile_id = auth.uid()
    )
  );

-- ── 4. Tabela: push_subscriptions ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  endpoint    TEXT NOT NULL,
  p256dh      TEXT NOT NULL,
  auth        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_provider
  ON public.push_subscriptions(provider_id);

-- ── 5. RLS: push_subscriptions ────────────────────────────────
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Prestador gerencia suas próprias subscriptions
CREATE POLICY "Prestador gerencia próprias subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (
    provider_id IN (
      SELECT id FROM public.providers WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    provider_id IN (
      SELECT id FROM public.providers WHERE profile_id = auth.uid()
    )
  );
