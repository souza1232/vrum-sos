-- =============================================================
-- Vrum SOS - Migration 002
-- Reviews, Notificações, Storage e Geolocalização
-- Execute no Supabase: SQL Editor → New Query → Cole e execute
-- =============================================================

-- ── 1. Adicionar lat/lng na tabela providers ──────────────────
ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS latitude  DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- ── 2. Tabela: reviews ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comentario  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)  -- um usuário, uma avaliação por prestador
);

-- ── 3. Tabela: notifications ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  titulo     TEXT NOT NULL,
  mensagem   TEXT NOT NULL,
  tipo       TEXT NOT NULL DEFAULT 'info'
               CHECK (tipo IN ('info', 'request', 'approval', 'status')),
  lida       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 4. Índices ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_reviews_provider   ON public.reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user       ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_lida ON public.notifications(lida);

-- ── 5. RLS: reviews ──────────────────────────────────────────
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um vê avaliações"
  ON public.reviews FOR SELECT USING (TRUE);

CREATE POLICY "Usuário avalia prestador"
  ON public.reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Usuário edita própria avaliação"
  ON public.reviews FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Usuário apaga própria avaliação"
  ON public.reviews FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admin gerencia avaliações"
  ON public.reviews FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo_usuario = 'admin')
  );

-- ── 6. RLS: notifications ─────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê próprias notificações"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Usuário marca como lida"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Sistema insere notificações"
  ON public.notifications FOR INSERT
  WITH CHECK (TRUE);  -- inserção controlada pelos triggers/services

CREATE POLICY "Admin gerencia notificações"
  ON public.notifications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo_usuario = 'admin')
  );

-- ── 7. Trigger: notificar prestador ao receber solicitação ─────
CREATE OR REPLACE FUNCTION public.notify_provider_new_request()
RETURNS TRIGGER AS $$
DECLARE
  v_provider_profile_id UUID;
  v_user_nome TEXT;
BEGIN
  SELECT profile_id INTO v_provider_profile_id
    FROM public.providers WHERE id = NEW.provider_id;

  SELECT nome INTO v_user_nome
    FROM public.profiles WHERE id = NEW.user_id;

  INSERT INTO public.notifications (user_id, titulo, mensagem, tipo)
  VALUES (
    v_provider_profile_id,
    'Nova solicitação de atendimento',
    v_user_nome || ' solicitou seu atendimento em ' || NEW.cidade || '.',
    'request'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_provider_request ON public.service_requests;
CREATE TRIGGER trg_notify_provider_request
  AFTER INSERT ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_provider_new_request();

-- ── 8. Trigger: notificar usuário quando status da solicitação muda ─
CREATE OR REPLACE FUNCTION public.notify_user_request_status()
RETURNS TRIGGER AS $$
DECLARE
  v_provider_nome TEXT;
  v_titulo TEXT;
  v_mensagem TEXT;
BEGIN
  IF OLD.status = NEW.status THEN RETURN NEW; END IF;

  SELECT nome INTO v_provider_nome FROM public.providers WHERE id = NEW.provider_id;

  v_titulo := CASE NEW.status
    WHEN 'em_andamento' THEN 'Atendimento iniciado!'
    WHEN 'concluido'    THEN 'Atendimento concluído!'
    WHEN 'cancelado'    THEN 'Solicitação cancelada'
    ELSE 'Atualização da solicitação'
  END;

  v_mensagem := CASE NEW.status
    WHEN 'em_andamento' THEN v_provider_nome || ' aceitou e iniciou seu atendimento.'
    WHEN 'concluido'    THEN v_provider_nome || ' marcou seu atendimento como concluído.'
    WHEN 'cancelado'    THEN 'Sua solicitação para ' || v_provider_nome || ' foi cancelada.'
    ELSE 'Status atualizado para: ' || NEW.status
  END;

  INSERT INTO public.notifications (user_id, titulo, mensagem, tipo)
  VALUES (NEW.user_id, v_titulo, v_mensagem, 'status');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_user_status ON public.service_requests;
CREATE TRIGGER trg_notify_user_status
  AFTER UPDATE OF status ON public.service_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_user_request_status();

-- ── 9. Trigger: notificar prestador quando aprovado/reprovado ─
CREATE OR REPLACE FUNCTION public.notify_provider_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_titulo TEXT;
  v_mensagem TEXT;
BEGIN
  IF OLD.status_aprovacao = NEW.status_aprovacao THEN RETURN NEW; END IF;

  v_titulo := CASE NEW.status_aprovacao
    WHEN 'aprovado'  THEN '🎉 Cadastro aprovado!'
    WHEN 'reprovado' THEN 'Cadastro reprovado'
    ELSE 'Status do cadastro atualizado'
  END;

  v_mensagem := CASE NEW.status_aprovacao
    WHEN 'aprovado'  THEN 'Parabéns! Seu perfil está visível para os usuários na plataforma.'
    WHEN 'reprovado' THEN 'Seu cadastro foi reprovado. Entre em contato com o suporte para mais informações.'
    ELSE 'Seu status foi atualizado para: ' || NEW.status_aprovacao
  END;

  INSERT INTO public.notifications (user_id, titulo, mensagem, tipo)
  VALUES (NEW.profile_id, v_titulo, v_mensagem, 'approval');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_provider_approval ON public.providers;
CREATE TRIGGER trg_notify_provider_approval
  AFTER UPDATE OF status_aprovacao ON public.providers
  FOR EACH ROW EXECUTE FUNCTION public.notify_provider_approval();

-- ── 10. Storage: bucket para fotos dos prestadores ───────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'provider-photos',
  'provider-photos',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Fotos são públicas"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'provider-photos');

CREATE POLICY "Prestador faz upload da própria foto"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'provider-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Prestador atualiza própria foto"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'provider-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Prestador apaga própria foto"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'provider-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
