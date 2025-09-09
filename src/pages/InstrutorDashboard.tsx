import { Card, CardContent, Grid, Typography } from '@mui/material'
import DashboardLayout, { NavItem } from '@/components/layout/DashboardLayout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import BadgeIcon from '@mui/icons-material/Badge'
import ApartmentIcon from '@mui/icons-material/Apartment'
import SettingsIcon from '@mui/icons-material/Settings'

const items: NavItem[] = [
  { label: 'Dashboard', icon: <DashboardIcon />, href: '/instrutor' },
  { label: 'Usuários', icon: <PeopleIcon />, href: '/instrutor/users' },
  { label: 'Cursos', icon: <SchoolIcon />, href: '/instrutor/courses' },
  {
    label: 'Departamentos',
    icon: <ApartmentIcon />,
    href: '/instrutor/departments',
  },
  { label: 'Configurações', icon: <SettingsIcon />, href: '/instrutor/settings' },
]

export default function InstrutorDashboard() {
  return (
    <DashboardLayout title='Instrutor Dashboard' items={items}>
      <Grid container spacing={3}>
        {['Active Users', 'Popular Courses', 'Completion Rate', 'Alerts'].map(
          t => (
            <Grid key={t} item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography fontWeight={700}>{t}</Typography>
                  <Typography color='text.secondary'>
                    Conteúdo em breve.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        )}
      </Grid>
    </DashboardLayout>
  )
}
