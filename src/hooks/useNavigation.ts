import { useAuth } from '@/contexts/AuthContext'
import type { NavItem } from '@/components/layout/DashboardLayout'

const NAV_FUNCIONARIO: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/funcionario' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Progresso', href: '/meu-progresso' },
  { label: 'Ranking', href: '/ranking' }
]

const NAV_INSTRUTOR: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/instrutor' },
  {
    label: 'Cursos',
    children: [
      { label: 'Catálogo de Cursos', href: '/cursos' },
      { label: 'Gerenciar Cursos', href: '/gerenciar/cursos' }
    ]
  },
  { label: 'Turmas', href: '/turmas' }
]

const NAV_GERENTE: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin' },
  {
    label: 'Cursos',
    children: [
      { label: 'Catálogo de Cursos', href: '/cursos' },
      { label: 'Gerenciar Cursos', href: '/gerenciar/cursos' }
    ]
  },
  {
    label: 'Usuários',
    children: [
      { label: 'Funcionários', href: '/gerenciar/funcionarios' },
      { label: 'Instrutores', href: '/gerenciar/instrutores' }
    ]
  },
  { label: 'Turmas', href: '/turmas' }
]

const NAV_ADMIN: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard/admin' },
  { label: 'Departamentos', href: '/gerenciar/departamentos' },
  { label: 'Categorias', href: '/gerenciar/categorias' },
  { label: 'Cursos', href: '/gerenciar/cursos' },
  {
    label: 'Usuários',
    children: [
      { label: 'Funcionários', href: '/gerenciar/funcionarios' },
      { label: 'Instrutores', href: '/gerenciar/instrutores' }
    ]
  },
  { label: 'Turmas', href: '/turmas' }
]

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  FUNCIONARIO: NAV_FUNCIONARIO,
  INSTRUTOR: NAV_INSTRUTOR,
  GERENTE: NAV_GERENTE,
  ADMIN: NAV_ADMIN
}

export function useNavigation() {
  const { user } = useAuth()
  const userRole = user?.role || 'FUNCIONARIO'

  const navigationItems = NAV_BY_ROLE[userRole] || NAV_FUNCIONARIO

  return {
    navigationItems,
    user,
    isAluno: userRole === 'FUNCIONARIO',
    isInstrutor: userRole === 'INSTRUTOR',
    isAdmin: userRole === 'ADMIN',
    isGerente: userRole === 'GERENTE',
    canManageCourses: ['INSTRUTOR', 'ADMIN'].includes(userRole),
    canManageDepartment: ['GERENTE', 'ADMIN'].includes(userRole),
    canViewReports: ['GERENTE', 'ADMIN'].includes(userRole)
  }
}

export default useNavigation
