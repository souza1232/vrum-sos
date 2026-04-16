import { PageSpinner } from '@/components/ui/Spinner'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <PageSpinner />
    </DashboardLayout>
  )
}
