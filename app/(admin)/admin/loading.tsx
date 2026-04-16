import { PageSpinner } from '@/components/ui/Spinner'
import AdminLayout from '@/components/layout/AdminLayout'

export default function AdminLoading() {
  return (
    <AdminLayout activeTab="dashboard">
      <PageSpinner />
    </AdminLayout>
  )
}
