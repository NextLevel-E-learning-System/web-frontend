import { Card, CardContent, Grid, Typography } from '@mui/material'
import DashboardLayout, { NavItem } from '@/components/layout/DashboardLayout'
import { useNavigation } from '@/hooks/useNavigation'

export default function AdminDashboard() {
  const { navigationItems } = useNavigation()

  return (
    <DashboardLayout title='Admin Dashboard' items={navigationItems}>
      <Grid container spacing={3}>
        {['Active Users', 'Popular Courses', 'Completion Rate', 'Alerts'].map(
          t => (
            <Grid size={{ xs: 12, md: 6 }} key={t}>
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
