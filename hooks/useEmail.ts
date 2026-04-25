import { useState } from 'react'

interface UseEmailReturn {
  sendWelcomeEmail: (email: string, nome: string) => Promise<boolean>
  sendProviderStatusEmail: (email: string, nome: string, status: 'pending' | 'approved', nomeEmpresa?: string) => Promise<boolean>
  sendServiceRequestEmail: (data: {
    prestadorEmail: string
    prestadorNome: string
    usuarioNome: string
    tipoServico: string
    cidade: string
    observacao?: string
  }) => Promise<boolean>
  isLoading: boolean
  error: string | null
}

export const useEmail = (): UseEmailReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendRequest = async (endpoint: string, data: any): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/emails/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao enviar email')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      console.error('Erro ao enviar email:', errorMessage)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const sendWelcomeEmail = async (email: string, nome: string): Promise<boolean> => {
    return sendRequest('welcome', { email, nome })
  }

  const sendProviderStatusEmail = async (
    email: string,
    nome: string,
    status: 'pending' | 'approved',
    nomeEmpresa?: string
  ): Promise<boolean> => {
    return sendRequest('provider-status', { email, nome, status, nomeEmpresa })
  }

  const sendServiceRequestEmail = async (data: {
    prestadorEmail: string
    prestadorNome: string
    usuarioNome: string
    tipoServico: string
    cidade: string
    observacao?: string
  }): Promise<boolean> => {
    return sendRequest('service-request', data)
  }

  return {
    sendWelcomeEmail,
    sendProviderStatusEmail,
    sendServiceRequestEmail,
    isLoading,
    error
  }
}