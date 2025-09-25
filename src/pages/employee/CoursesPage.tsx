import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import DashboardLayout, { NavItem } from '@/components/layout/DashboardLayout'
import { useMeuPerfil } from '@/api/users'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useCourseCatalog,
  useCategories,
  type Course as Curso,
  type CreateCourseInput as CriarCurso,
  type CatalogFilters as FiltrosCatalogo,
} from '@/api/courses'
import CategoryChips from '@/components/employee/CategoryChips'
import CourseCard from '@/components/employee/CourseCard'
import CourseNavbar from '@/components/employee/CourseNavbar'
import FilterBar from '@/components/common/FilterBar'

const categories = [
  { label: 'Programação', color: '#2563eb' },
  { label: 'Design', color: '#e11d48' },
  { label: 'Negócios', color: '#0ea5e9' },
  { label: 'Marketing', color: '#84cc16' },
  { label: 'TI & Software', color: '#06b6d4' },
  { label: 'Ciência', color: '#8b5cf6' },
  { label: 'Idiomas', color: '#f59e0b' },
  { label: 'Saúde & Fitness', color: '#22c55e' },
]

export default function Courses() {
  const { data: user } = useMeuPerfil()
  const { navigationItems, canManageCourses, isInstrutor, isAdmin } =
    useNavigation()
  return (
    <DashboardLayout items={navigationItems}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant='h5' fontWeight={800}>
          Explorar cursos
        </Typography>
        <TextField size='small' placeholder='Buscar cursos...' />
      </Box>
 <FilterBar />
      <CategoryChips categories={categories} />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CourseCard
            title='React Avançado e Redux'
            category='Programação'
            hours='12h total'
            price='R$ 89'
            rating={4.8}
            gradientFrom='#ef4444'
            gradientTo='#f97316'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {' '}
          <CourseCard
            title='TypeScript do Zero'
            category='Programação'
            hours='10h total'
            price='R$ 79'
            rating={4.7}
            gradientFrom='#22c55e'
            gradientTo='#06b6d4'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {' '}
          <CourseCard
            title='Design de Interfaces'
            category='Design'
            hours='8h total'
            price='R$ 69'
            rating={4.6}
            gradientFrom='#3b82f6'
            gradientTo='#8b5cf6'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CourseCard
            title='Marketing Digital'
            category='Marketing'
            hours='7h total'
            price='R$ 59'
            rating={4.5}
            gradientFrom='#14b8a6'
            gradientTo='#84cc16'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CourseCard
            title='Liderança e Gestão'
            category='Negócios'
            hours='9h total'
            price='R$ 89'
            rating={4.7}
            gradientFrom='#a855f7'
            gradientTo='#2563eb'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <CourseCard
            title='Noções de Cloud'
            category='TI & Software'
            hours='6h total'
            price='R$ 49'
            rating={4.6}
            gradientFrom='#0ea5e9'
            gradientTo='#6366f1'
          />
        </Grid>
      </Grid>
    </DashboardLayout>
  )
}
