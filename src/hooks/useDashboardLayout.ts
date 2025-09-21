import { useNavigation } from './useNavigation'
import { useMeuPerfil } from '@/api/users'

export function useDashboardLayout() {
  const { navigationItems, user, isAluno, isInstrutor, isAdmin, isGerente } =
    useNavigation()
  const { data: perfil } = useMeuPerfil()

  // Definir títulos baseados no papel do usuário
  const getDashboardTitle = () => {
    if (isAdmin) return 'Dashboard do Administrador'
    if (isGerente) return 'Dashboard do Gerente'
    if (isInstrutor) return 'Dashboard do Instrutor'
    if (isAluno) return 'Dashboard do Aluno'
    return 'Dashboard'
  }

  // Definir rota do dashboard baseada no papel
  const getDashboardRoute = () => {
    if (isAdmin || isGerente) return '/dashboard/admin'
    if (isInstrutor) return '/dashboard/instrutor'
    if (isAluno) return '/dashboard/funcionario'
    return '/dashboard'
  }

  return {
    title: getDashboardTitle(),
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
