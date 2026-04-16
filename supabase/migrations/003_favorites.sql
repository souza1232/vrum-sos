-- ============================================================
-- Migration 003: Tabela de favoritos
-- ============================================================

CREATE TABLE IF NOT EXISTS favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_provider_id ON favorites(provider_id);

-- RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê apenas seus favoritos"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário adiciona aos seus favoritos"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário remove dos seus favoritos"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
