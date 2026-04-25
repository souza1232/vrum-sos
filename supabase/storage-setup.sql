-- =============================================================
-- Vrum SOS - Configuração do Storage para fotos dos prestadores
-- Execute no Supabase: SQL Editor → New Query → Cole e execute
-- =============================================================

-- 1. Criar bucket para fotos dos prestadores
INSERT INTO storage.buckets (id, name, public)
VALUES ('provider-photos', 'provider-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Prestadores podem fazer upload de suas próprias fotos
CREATE POLICY "Prestadores podem fazer upload de suas fotos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'provider-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Política: Todos podem ver fotos públicas
CREATE POLICY "Fotos são públicas para visualização"
ON storage.objects FOR SELECT
USING (bucket_id = 'provider-photos');

-- 4. Política: Prestadores podem atualizar suas fotos
CREATE POLICY "Prestadores podem atualizar suas fotos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'provider-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. Política: Prestadores podem deletar suas fotos
CREATE POLICY "Prestadores podem deletar suas fotos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'provider-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- =============================================================
-- Verificar se foi criado corretamente
-- =============================================================
SELECT * FROM storage.buckets WHERE id = 'provider-photos';