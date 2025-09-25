import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import DashboardLayout, { NavItem } from '@/components/layout/DashboardLayout'
import { useMeuPerfil } from '@/api/users'
import { useNavigation } from '@/hooks/useNavigation'
import CodeIcon from "@mui/icons-material/Code";
import BrushIcon from "@mui/icons-material/Brush";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CampaignIcon from "@mui/icons-material/Campaign";
import ComputerIcon from "@mui/icons-material/Computer";
import ScienceIcon from "@mui/icons-material/Science";
import TranslateIcon from "@mui/icons-material/Translate";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
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
import { Pagination } from '@mui/material'

export interface TileCategory {
  label: string
  gradientFrom: string
  gradientTo: string
  icon?: React.ReactNode
  count?: number
}

const categories: TileCategory[] = [
  {
    label: 'Programming',
    gradientFrom: '#6366f1',
    gradientTo: '#06b6d4',
    icon: <CodeIcon sx={{ color: '#fff' }} />,
    count: 126,
  },
  {
    label: 'Design',
    gradientFrom: '#f43f5e',
    gradientTo: '#f97316',
    icon: <BrushIcon sx={{ color: '#fff' }} />,
    count: 98,
  },
  {
    label: 'Business',
    gradientFrom: '#10b981',
    gradientTo: '#06b6d4',
    icon: <BusinessCenterIcon sx={{ color: '#fff' }} />,
    count: 72,
  },
  {
    label: 'Marketing',
    gradientFrom: '#f59e0b',
    gradientTo: '#f97316',
    icon: <CampaignIcon sx={{ color: '#fff' }} />,
    count: 64,
  },
  {
    label: 'IT & Software',
    gradientFrom: '#3b82f6',
    gradientTo: '#6366f1',
    icon: <ComputerIcon sx={{ color: '#fff' }} />,
    count: 113,
  },
  {
    label: 'Science',
    gradientFrom: '#a855f7',
    gradientTo: '#6366f1',
    icon: <ScienceIcon sx={{ color: '#fff' }} />,
    count: 58,
  },
  {
    label: 'Languages',
    gradientFrom: '#22c55e',
    gradientTo: '#06b6d4',
    icon: <TranslateIcon sx={{ color: '#fff' }} />,
    count: 45,
  },
  {
    label: 'Health & Fitness',
    gradientFrom: '#ef4444',
    gradientTo: '#f97316',
    icon: <FavoriteBorderIcon sx={{ color: '#fff' }} />,
    count: 37,
  },
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
      <CategoryChips items={categories} />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <CourseCard
            title='React Avançado e Redux'
            category='Programação'
            hours='12h total'
           description="Master advanced React patterns and Redux state management for building complex applications."
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
            description="Aprenda TypeScript do zero e crie aplicações robustas."
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
            description="Aprenda a criar interfaces incríveis com as melhores práticas de design."
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
            description="Aprenda as melhores estratégias de marketing digital para alavancar seu negócio."
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination count={14} page={2} shape='rounded' color='primary' />
      </Box>
    </DashboardLayout>
  )
}
