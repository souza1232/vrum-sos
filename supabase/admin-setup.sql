-- =============================================================
-- Vrum SOS - Configuração do Admin Inicial
--
-- PASSO A PASSO:
-- 1. Primeiro: Crie um usuário normalmente pelo site (/register)
-- 2. Depois: Execute este SQL substituindo o email
-- =============================================================

-- Transformar usuário em admin
-- ⚠️ SUBSTITUA o email pelo email real que você usou no cadastro
UPDATE public.profiles
SET tipo_usuario = 'admin'
WHERE email = 'SEU_EMAIL_AQUI@gmail.com';

-- Verificar se funcionou
SELECT nome, email, tipo_usuario, created_at
FROM public.profiles
WHERE tipo_usuario = 'admin';

-- =============================================================
-- Resultado esperado: deve mostrar seu usuário como 'admin'
-- =============================================================