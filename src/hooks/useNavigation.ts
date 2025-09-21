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
import { useMeuPerfil } from './users'

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
          icon: React.createElement(DashboardIcon),
          href: '/dashboard/funcionario', // Rota correta para ALUNO
        },
        {
          label: 'Cursos',
          icon: React.createElement(SchoolIcon),
          children: [
            {
              label: 'Catálogo de Cursos',
              icon: React.createElement(SchoolIcon),
              href: '/cursos',
            },
            {
              label: 'Meus Cursos',
              icon: React.createElement(BookIcon),
              href: '/meus-cursos',
            },
            {
              label: 'Certificados',
              icon: React.createElement(SchoolIcon),
              href: '/certificados',
            },
          ],
        },
        {
          label: 'Conquistas',
          icon: React.createElement(EmojiEventsIcon),
          href: '/conquistas',
        },
        {
          label: 'Ranking',
          icon: React.createElement(WorkspacePremiumIcon),
          href: '/ranking',
        },
        {
          label: 'Configurações',
          icon: React.createElement(SettingsIcon),
          href: '/configuracoes',
        },
      ]
    }

    // INSTRUTOR - Gerencia próprios cursos e turmas
    if (isInstrutor) {
      return [
        {
          label: 'Dashboard',
          icon: React.createElement(DashboardIcon),
          href: '/dashboard/instrutor',
        },
        {
          label: 'Cursos',
          icon: React.createElement(SchoolIcon),
          children: [
            {
              label: 'Meus Cursos',
              icon: React.createElement(SchoolIcon),
              href: '/instrutor/cursos',
            },
            {
              label: 'Criar Curso',
              icon: React.createElement(BookIcon),
              href: '/instrutor/criar-curso',
            },
            {
              label: 'Avaliações',
              icon: React.createElement(AssignmentIcon),
              href: '/instrutor/avaliacoes',
            },
          ],
        },
        {
          label: 'Turmas',
          icon: React.createElement(PeopleIcon),
          href: '/instrutor/turmas',
        },
        {
          label: 'Configurações',
          icon: React.createElement(SettingsIcon),
          href: '/instrutor/configuracoes',
        },
      ]
    }

    // GERENTE - Acesso ao departamento e relatórios (mesmo dashboard que ADMIN)
    if (isGerente) {
      return [
        {
          label: 'Dashboard',
          icon: React.createElement(DashboardIcon),
          href: '/dashboard/admin', // Mesmo dashboard que ADMIN
        },
        {
          label: 'Meu Departamento',
          icon: React.createElement(ApartmentIcon),
          children: [
            {
              label: 'Funcionários',
              icon: React.createElement(PeopleIcon),
              href: '/admin/users', // Mesma página, mas filtrada
            },
            {
              label: 'Relatórios',
              icon: React.createElement(AssignmentIcon),
              href: '/admin/relatorios', // Mesma página, mas filtrada
            },
            {
              label: 'Progresso da Equipe',
              icon: React.createElement(GradeIcon),
              href: '/admin/courses', // Mesma página, mas filtrada
            },
          ],
        },
        {
          label: 'Cursos',
          icon: React.createElement(SchoolIcon),
          children: [
            {
              label: 'Catálogo de Cursos',
              icon: React.createElement(SchoolIcon),
              href: '/cursos',
            },
            {
              label: 'Cursos do Departamento',
              icon: React.createElement(BookIcon),
              href: '/admin/courses', // Filtrado por departamento
            },
          ],
        },
      ]
    }

    // ADMIN - Acesso total ao sistema
    if (isAdmin) {
      return [
        {
          label: 'Dashboard',
          icon: React.createElement(DashboardIcon),
          href: '/dashboard/admin',
        },
        {
          label: 'Departamentos',
          icon: React.createElement(ApartmentIcon),
          href: '/admin/departments',
        },
        {
          label: 'Categorias',
          icon: React.createElement(AssignmentIcon),
          href: '/admin/categorias',
        },
        {
          label: 'Cursos',
          icon: React.createElement(SchoolIcon),
          href: '/admin/courses',
        },
        {
          label: 'Usuários',
          icon: React.createElement(PeopleIcon),
          children: [
            {
              label: 'Funcionários',
              icon: React.createElement(PeopleIcon),
              href: '/admin/users',
            },
            {
              label: 'Instrutores',
              icon: React.createElement(BadgeIcon),
              href: '/admin/instructors',
            },
          ],
        },
        {
          label: 'Relatórios',
          icon: React.createElement(GradeIcon),
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
