-- =============================================================
-- Migration 004: Correções e melhorias
-- =============================================================

-- ── 1. foto_url na tabela profiles (para página de perfil do usuário) ──
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- ── 2. Ampliar tipos aceitos em notifications.tipo ────────────
-- O tipo 'avaliacao' é usado para lembrete de avaliação após conclusão
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_tipo_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_tipo_check
  CHECK (tipo IN ('info', 'request', 'approval', 'status', 'avaliacao'));

-- ── 3. Política DELETE para notificações (usuário pode apagar as suas) ──
CREATE POLICY "Usuário apaga próprias notificações"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- ── 4. Nota sobre uploads de avatar ──────────────────────────
-- Usuários fazem upload para: {userId}/avatar.{ext} (sem subpasta)
-- A política existente em 002 já cobre: (storage.foldername(name))[1] = auth.uid()
-- Nenhuma policy adicional necessária.
