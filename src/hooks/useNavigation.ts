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
          href: '/dashboard/funcionario' 
        },
        { 
          label: 'Catálogo de Cursos', 
          icon: React.createElement(SchoolIcon), 
          href: '/catalogo' 
        },
        { 
          label: 'Meus Cursos', 
          icon: React.createElement(BookIcon), 
          href: '/meus-cursos' 
        },
        { 
          label: 'Conquistas', 
          icon: React.createElement(EmojiEventsIcon), 
          href: '/conquistas' 
        },
        { 
          label: 'Ranking', 
          icon: React.createElement(WorkspacePremiumIcon), 
          href: '/ranking' 
        },
        { 
          label: 'Certificados', 
          icon: React.createElement(SchoolIcon), 
          href: '/certificados' 
        },
        { 
          label: 'Configurações', 
          icon: React.createElement(SettingsIcon), 
          href: '/configuracoes' 
        },
      ]
    }

    if (isInstrutor) {
      return [
        { 
          label: 'Dashboard', 
          icon: React.createElement(DashboardIcon), 
          href: '/dashboard/instrutor' 
        },
        { 
          label: 'Usuários', 
          icon: React.createElement(PeopleIcon), 
          href: '/instrutor/users' 
        },
        { 
          label: 'Cursos', 
          icon: React.createElement(SchoolIcon), 
          href: '/cursos' 
        },
        { 
          label: 'Avaliações', 
          icon: React.createElement(AssignmentIcon), 
          href: '/avaliacoes' 
        },
        { 
          label: 'Departamentos', 
          icon: React.createElement(ApartmentIcon), 
          href: '/instrutor/departments' 
        },
        { 
          label: 'Configurações', 
          icon: React.createElement(SettingsIcon), 
          href: '/instrutor/settings' 
        },
      ]
    }

    if (isAdmin) {
      return [
        { 
          label: 'Dashboard', 
          icon: React.createElement(DashboardIcon), 
          href: '/dashboard/admin' 
        },
        { 
          label: 'Usuários', 
          icon: React.createElement(PeopleIcon), 
          href: '/admin/users' 
        },
        { 
          label: 'Cursos', 
          icon: React.createElement(SchoolIcon), 
          href: '/cursos' 
        },
        { 
          label: 'Instrutores', 
          icon: React.createElement(BadgeIcon), 
          href: '/admin/instructors' 
        },
        { 
          label: 'Avaliações', 
          icon: React.createElement(AssignmentIcon), 
          href: '/avaliacoes' 
        },
        { 
          label: 'Notas', 
          icon: React.createElement(GradeIcon), 
          href: '/notas' 
        },
        { 
          label: 'Departamentos', 
          icon: React.createElement(ApartmentIcon), 
          href: '/admin/departments' 
        },
        { 
          label: 'Configurações', 
          icon: React.createElement(SettingsIcon), 
          href: '/admin/settings' 
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
