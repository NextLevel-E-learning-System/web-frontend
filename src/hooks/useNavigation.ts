import { useDashboardCompleto } from '@/api/users'
import type { NavItem } from '@/components/layout/DashboardLayout'

export function useNavigation() {
  const { perfil } = useDashboardCompleto()

  // Cada usuário tem apenas 1 role - simples assim
  const userRole = perfil?.roles?.[0]
  const isAluno = userRole === 'ALUNO'
  const isInstrutor = userRole === 'INSTRUTOR'
  const isAdmin = userRole === 'ADMIN'
  const isGerente = userRole === 'GERENTE'
  const getNavigationItems = (): NavItem[] => {
    // ALUNO - Acesso básico aos cursos e gamificação
    if (isAluno) {
      return [
        {
          label: 'Dashboard',
          href: '/dashboard/funcionario', // Rota correta para ALUNO
        },
        {
          label: 'Cursos',
          href: '/cursos',
        },
        {
          label: 'Progresso',
          href: '/meu-progresso',
        },
        {
          label: 'Ranking',
          href: '/ranking',
        },
      ]
    }

    // INSTRUTOR - Gerencia próprios cursos e turmas
    if (isInstrutor) {
      return [
        {
          label: 'Dashboard',
          href: '/dashboard/instrutor',
        },
        {
          label: 'Cursos',
          children: [
            {
              label: 'Catálogo de Cursos',
              href: '/cursos',
            },
            {
              label: 'Gerenciar Cursos',
              href: '/gerenciar/cursos',
            },
          ],
        },
        {
          label: 'Turmas',
          href: '/turmas',
        },
      ]
    }

    // GERENTE - Acesso ao departamento e relatórios (mesmo dashboard que ADMIN)
    if (isGerente) {
      return [
        {
          label: 'Dashboard',
          href: '/dashboard/admin', // Mesmo dashboard que ADMIN
        },
        {
          label: 'Cursos',
          children: [
            {
              label: 'Catálogo de Cursos',
              href: '/cursos',
            },
            {
              label: 'Gerenciar Cursos',
              href: '/gerenciar/cursos', // Filtrado por departamento
            },
          ],
        },
        {
          label: 'Usuários',
          children: [
            {
              label: 'Funcionários',
              href: '/gerenciar/funcionarios', // Mesma página, mas filtrada
            },
            {
              label: 'Instrutores',
              href: '/gerenciar/instrutores',
            },
          ],
        },
        {
          label: 'Turmas',
          href: '/turmas', // Mesma página, mas filtrada
        },
      ]
    }

    // ADMIN - Acesso total ao sistema
    if (isAdmin) {
      return [
        {
          label: 'Dashboard',
          href: '/dashboard/admin',
        },
        {
          label: 'Departamentos',
          href: '/gerenciar/departamentos',
        },
        {
          label: 'Categorias',
          href: '/gerenciar/categorias',
        },
        {
          label: 'Cursos',
          href: '/gerenciar/cursos',
        },
        {
          label: 'Usuários',
          children: [
            {
              label: 'Funcionários',
              href: '/gerenciar/funcionarios',
            },
            {
              label: 'Instrutores',
              href: '/gerenciar/instrutores',
            },
          ],
        },
        {
          label: 'Turmas',
          href: '/turmas',
        },
      ]
    }

    return []
  }

  return {
    navigationItems: getNavigationItems(),
    perfil,
    isAluno,
    isInstrutor,
    isAdmin,
    isGerente,
    canManageCourses: isInstrutor || isAdmin,
    canManageDepartment: isGerente || isAdmin,
    canViewReports: isGerente || isAdmin,
  }
}

export default useNavigation
