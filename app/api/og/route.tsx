import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { TIPOS_SERVICO_LABELS, TipoServico } from '@/types'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const COR_SERVICO: Record<TipoServico, string> = {
  mecanico: '#3b82f6',
  eletricista: '#eab308',
  chaveiro: '#a855f7',
  borracheiro: '#22c55e',
  guincho: '#ef4444',
  guincho_pesado: '#f97316',
}

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')

  if (!id) return defaultImage()

  const { data: p } = await supabase
    .from('providers')
    .select('nome, nome_empresa, cidade, estado, tipos_servico, foto_url')
    .eq('id', id)
    .eq('status_aprovacao', 'aprovado')
    .single()

  if (!p) return defaultImage()

  const nome = p.nome_empresa || p.nome
  const servicos: TipoServico[] = (p.tipos_servico ?? []).slice(0, 4)

  let fotoData: string | null = null
  if (p.foto_url) {
    try {
      const res = await fetch(p.foto_url)
      const buf = await res.arrayBuffer()
      const b64 = Buffer.from(buf).toString('base64')
      const mime = res.headers.get('content-type') ?? 'image/jpeg'
      fotoData = `data:${mime};base64,${b64}`
    } catch {
      fotoData = null
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          padding: '56px 64px',
          justifyContent: 'space-between',
        }}
      >
        {/* Barra laranja topo */}
        <div style={{ display: 'flex', width: '80px', height: '6px', backgroundColor: '#f97316', borderRadius: '999px' }} />

        {/* Conteúdo central */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', flex: 1, marginTop: '40px' }}>
          {/* Foto ou inicial */}
          <div
            style={{
              display: 'flex',
              width: '120px',
              height: '120px',
              borderRadius: '20px',
              overflow: 'hidden',
              backgroundColor: '#f97316',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {fotoData ? (
              <img src={fotoData} width={120} height={120} style={{ objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '52px', fontWeight: 900, color: 'white' }}>
                {p.nome.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Textos */}
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '36px', flex: 1 }}>
            <div style={{ fontSize: '42px', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
              {nome}
            </div>
            {p.nome_empresa && p.nome !== nome && (
              <div style={{ fontSize: '22px', color: '#94a3b8', marginTop: '6px' }}>
                {p.nome}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '20px', color: '#94a3b8' }}>
                📍 {p.cidade}, {p.estado}
              </span>
            </div>

            {/* Chips de serviço */}
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: '20px', gap: '0px' }}>
              {servicos.map((s, i) => (
                <div
                  key={s}
                  style={{
                    display: 'flex',
                    backgroundColor: COR_SERVICO[s] + '22',
                    border: `1.5px solid ${COR_SERVICO[s]}55`,
                    color: COR_SERVICO[s],
                    borderRadius: '999px',
                    padding: '6px 16px',
                    fontSize: '17px',
                    fontWeight: 600,
                    marginRight: '10px',
                  }}
                >
                  {TIPOS_SERVICO_LABELS[s]}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #1e293b',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                display: 'flex',
                width: '36px',
                height: '36px',
                backgroundColor: '#f97316',
                borderRadius: '10px',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '10px',
              }}
            >
              <span style={{ fontSize: '20px' }}>⚡</span>
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: 'white' }}>
              Vrum <span style={{ color: '#fb923c' }}>SOS</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', color: '#22c55e', marginRight: '8px' }}>✓</span>
            <span style={{ fontSize: '18px', color: '#64748b' }}>Prestador verificado</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}

function defaultImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              width: '60px',
              height: '60px',
              backgroundColor: '#f97316',
              borderRadius: '16px',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
            }}
          >
            <span style={{ fontSize: '32px' }}>⚡</span>
          </div>
          <span style={{ fontSize: '52px', fontWeight: 900, color: 'white' }}>
            Vrum <span style={{ color: '#fb923c' }}>SOS</span>
          </span>
        </div>
        <div style={{ fontSize: '24px', color: '#64748b', marginTop: '16px' }}>
          Assistência automotiva 24h
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
