'use client'

import dynamic from 'next/dynamic'
import { Provider } from '@/types'
import { PageSpinner } from '@/components/ui/Spinner'

const ProviderMap = dynamic(() => import('./ProviderMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
      <PageSpinner />
    </div>
  ),
})

interface ProviderMapWrapperProps {
  providers: Provider[]
  highlightId?: string
  center?: [number, number]
  zoom?: number
  showRadius?: boolean
  className?: string
}

export default function ProviderMapWrapper(props: ProviderMapWrapperProps) {
  return (
    <div className={props.className ?? 'h-[500px] rounded-2xl overflow-hidden'}>
      <ProviderMap {...props} />
    </div>
  )
}
