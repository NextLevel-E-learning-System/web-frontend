import { useNavigation } from './useNavigation'
import { useMeuPerfil } from '@/api/users'

export function useDashboardLayout() {
  const { navigationItems, user, isAluno, isInstrutor, isAdmin, isGerente } =
    useNavigation()
  const { data: perfil } = useMeuPerfil()

  // Definir rota do dashboard baseada no papel
  const getDashboardRoute = () => {
    if (isAdmin || isGerente) return '/dashboard/admin'
    if (isInstrutor) return '/dashboard/instrutor'
    if (isAluno) return '/dashboard/funcionario'
    return '/dashboard'
  }

  return {
    navigationItems,
    user,
    perfil,
    isAluno,
    isInstrutor,
    isAdmin,
    isGerente,
    dashboardRoute: getDashboardRoute(),
  }
}

export default useDashboardLayout
