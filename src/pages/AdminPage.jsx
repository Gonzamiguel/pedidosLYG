import { useNavigate } from 'react-router-dom'
import AdminDashboard from '../components/AdminDashboard'
import { useCatalog } from '../hooks/useCatalog'

export default function AdminPage() {
  const catalog = useCatalog()
  const navigate = useNavigate()

  return (
    <AdminDashboard
      catalog={catalog}
      onBack={() => {
        catalog.refresh()
        navigate('/')
      }}
    />
  )
}
