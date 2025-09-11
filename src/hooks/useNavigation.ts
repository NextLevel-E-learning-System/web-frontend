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

  const isInstrutor = user?.tipo_usuario === 'INSTRUTOR'
  const isAdmin = user?.tipo_usuario === 'ADMIN'
  const isFuncionario = user?.tipo_usuario === 'FUNCIONARIO'

  const getNavigationItems = (): NavItem[] => {
    if (isFuncionario) {
      return [
        {
          label: 'Dashboard',
          icon: React.createElement(DashboardIcon),
          href: '/dashboard/funcionario',
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
              label: 'Todos os Cursos',
              icon: React.createElement(SchoolIcon),
              href: '/cursos',
            },
            {
              label: 'Minhas Turmas',
              icon: React.createElement(BookIcon),
              href: '/instrutor/turmas',
            },
            {
              label: 'Avaliações',
              icon: React.createElement(AssignmentIcon),
              href: '/avaliacoes',
            },
          ],
        },
        {
          label: 'Configurações',
          icon: React.createElement(SettingsIcon),
          href: '/instrutor/settings',
        },
      ]
    }

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
          href: '/cursos',
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
      ]
    }
  }

  return {
    navigationItems: getNavigationItems(),
    user,
    isInstrutor,
    isAdmin,
    isFuncionario,
    canManageCourses: isInstrutor || isAdmin,
  }
}

export default useNavigation
