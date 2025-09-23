import React from 'react'
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Settings as SettingsIcon,
  Book as BookIcon,
  EmojiEvents as EmojiEventsIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  People as PeopleIcon,
  Badge as BadgeIcon,
  Apartment as ApartmentIcon,
} from '@mui/icons-material'
import { NavItem } from '@/components/layout/DashboardLayout'
import { useMeuPerfil } from '@/api/users'

export function useNavigation() {
  const { data: user } = useMeuPerfil()

  // Cada usuário tem apenas 1 role - simples assim
  const userRole = user?.tipo_usuario
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
          children: [
            {
              label: 'Catálogo de Cursos',
              href: '/cursos',
            },
            {
              label: 'Meus Cursos',
              href: '/meus-cursos',
            },
            {
              label: 'Certificados',
              href: '/certificados',
            },
          ],
        },
        {
          label: 'Conquistas',
          href: '/conquistas',
        },
        {
          label: 'Ranking',
          href: '/ranking',
        },
        {
          label: 'Configurações',
          href: '/configuracoes',
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
              label: 'Meus Cursos',
              href: '/instrutor/cursos',
            },
            {
              label: 'Criar Curso',
              href: '/instrutor/criar-curso',
            },
            {
              label: 'Avaliações',
              href: '/instrutor/avaliacoes',
            },
          ],
        },
        {
          label: 'Turmas',
          href: '/instrutor/turmas',
        },
        {
          label: 'Configurações',
          href: '/instrutor/configuracoes',
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
              label: 'Cursos do Departamento',
              href: '/admin/courses', // Filtrado por departamento
            },
            {
              label: 'Progresso da Equipe',
              href: '/admin/courses', // Mesma página, mas filtrada
            },
          ],
        },
        {
          label: 'Usuários',
          children: [
            {
              label: 'Alunos',
              href: '/admin/users', // Mesma página, mas filtrada
            },
            {
              label: 'Instrutores',
              href: '/admin/instructors',
            },
          ],
        },
        {
          label: 'Relatórios',
          href: '/admin/relatorios', // Mesma página, mas filtrada
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
          href: '/admin/departments',
        },
        {
          label: 'Categorias',
          href: '/admin/categorias',
        },
        {
          label: 'Cursos',
          href: '/admin/courses',
        },
        {
          label: 'Usuários',
          children: [
            {
              label: 'Funcionários',
              href: '/admin/users',
            },
            {
              label: 'Instrutores',
              href: '/admin/instructors',
            },
          ],
        },
        {
          label: 'Relatórios',
          href: '/admin/relatorios',
        },
      ]
    }
  }

  return {
    navigationItems: getNavigationItems(),
    user,
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
