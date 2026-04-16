import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    outline: 'border border-gray-300 text-gray-600',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}

// Badge de status de aprovação
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    pendente: { label: 'Pendente', variant: 'warning' },
    aprovado: { label: 'Aprovado', variant: 'success' },
    reprovado: { label: 'Reprovado', variant: 'danger' },
    em_andamento: { label: 'Em andamento', variant: 'info' },
    concluido: { label: 'Concluído', variant: 'success' },
    cancelado: { label: 'Cancelado', variant: 'danger' },
  }

  const config = map[status] ?? { label: status, variant: 'default' as const }

  return <Badge variant={config.variant}>{config.label}</Badge>
}
