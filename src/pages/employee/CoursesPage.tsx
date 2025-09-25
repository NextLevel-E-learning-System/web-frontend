import { Grid } from '@mui/material'
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
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SecurityIcon from "@mui/icons-material/Security";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GavelIcon from "@mui/icons-material/Gavel";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import GroupIcon from "@mui/icons-material/Group";
import ConstructionIcon from "@mui/icons-material/Construction";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  useCourseCatalog,
  useCategories,
  type Course as Curso,
  type Category,
  type CatalogFilters as FiltrosCatalogo,
} from '@/api/courses'
import CategoryChips from '@/components/employee/CategoryChips'
import CourseCard from '@/components/employee/CourseCard'
import CourseNavbar from '@/components/employee/CourseNavbar'
import FilterBar from '@/components/common/FilterBar'
import { Pagination, CircularProgress, Alert } from '@mui/material'
import { useState, useMemo } from 'react'

export interface TileCategory {
  label: string
  gradientFrom: string
  gradientTo: string
  icon?: React.ReactNode
  count?: number
}

// Mapeamento de ícones baseado no código da categoria
const getCategoryIcon = (categoryCodigo: string) => {
  const codigo = categoryCodigo.toLowerCase()

  // Códigos existentes
  switch (codigo) {
    case 'compliance':
      return <GavelIcon sx={{ color: '#fff' }} />
    case 'desenvolvimento':
      return <CodeIcon sx={{ color: '#fff' }} />
    case 'design':
      return <BrushIcon sx={{ color: '#fff' }} />
    case 'financeiro':
      return <AccountBalanceIcon sx={{ color: '#fff' }} />
    case 'integração':
    case 'integracao':
      return <IntegrationInstructionsIcon sx={{ color: '#fff' }} />
    case 'logística':
    case 'logistica':
      return <LocalShippingIcon sx={{ color: '#fff' }} />
    case 'marketing':
      return <CampaignIcon sx={{ color: '#fff' }} />
    case 'segurança':
    case 'seguranca':
      return <SecurityIcon sx={{ color: '#fff' }} />
    case 'vendas':
      return <StorefrontIcon sx={{ color: '#fff' }} />
    
    // Códigos adicionais prováveis
    case 'ti':
    case 'tecnologia':
    case 'informatica':
      return <ComputerIcon sx={{ color: '#fff' }} />
    case 'rh':
    case 'recursos-humanos':
    case 'pessoas':
      return <GroupIcon sx={{ color: '#fff' }} />
    case 'operacional':
    case 'operacoes':
    case 'producao':
      return <ConstructionIcon sx={{ color: '#fff' }} />
    case 'qualidade':
    case 'sst':
    case 'meio-ambiente':
      return <HealthAndSafetyIcon sx={{ color: '#fff' }} />
    case 'liderança':
    case 'lideranca':
    case 'gestao':
      return <BusinessCenterIcon sx={{ color: '#fff' }} />
    case 'vendas-avancadas':
    case 'comercial':
      return <TrendingUpIcon sx={{ color: '#fff' }} />
    case 'soft-skills':
    case 'comportamental':
      return <PsychologyIcon sx={{ color: '#fff' }} />
    case 'dados':
    case 'analytics':
    case 'ciencia':
      return <ScienceIcon sx={{ color: '#fff' }} />
    
    // Default
    default:
      return <SchoolIcon sx={{ color: '#fff' }} />
  }
}

export default function Courses() {
  const { data: user } = useMeuPerfil()
  const { navigationItems, canManageCourses, isInstrutor, isAdmin } = useNavigation()
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 6

  // Filtros para a API
  const filters: FiltrosCatalogo = useMemo(() => {
    const f: FiltrosCatalogo = {}
    if (searchTerm.trim()) {
      f.q = searchTerm.trim()
    }
    if (selectedCategory) {
      f.categoria_id = selectedCategory
    }
    return f
  }, [searchTerm, selectedCategory])

  // Hooks da API
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const { data: courses, isLoading: coursesLoading, error: coursesError } = useCourseCatalog(filters)

  // Função para converter hex para rgba
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Processamento das categorias para o componente CategoryChips
  const processedCategories: TileCategory[] = useMemo(() => {
    if (!categories) return []
    
    return categories.map(category => {
      // Sempre usar cor do backend (cor_hex sempre existe)
      const rgb = hexToRgb(category.cor_hex)
      const gradientColors = rgb ? {
        gradientFrom: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
        gradientTo: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
      } : {
        gradientFrom: '#6b7280',
        gradientTo: '#374151',
      }
      
      // Contar cursos por categoria
      const courseCount = courses?.filter(course => course.categoria_id === category.codigo).length || 0
      
      return {
        label: category.codigo,
        ...gradientColors,
        icon: getCategoryIcon(category.codigo),
        count: courseCount,
      }
    })
  }, [categories, courses])

  // Paginação dos cursos
  const paginatedCourses = useMemo(() => {
    if (!courses) return []
    const startIndex = (currentPage - 1) * coursesPerPage
    return courses.slice(startIndex, startIndex + coursesPerPage)
  }, [courses, currentPage, coursesPerPage])

  const totalPages = Math.ceil((courses?.length || 0) / coursesPerPage)

  // Função para obter cor da categoria para o CourseCard
  const getCourseCardGradient = (categoryId?: string) => {
    if (!categoryId || !categories) {
      return { gradientFrom: '#6b7280', gradientTo: '#374151' }
    }
    
    const category = categories.find(c => c.codigo === categoryId)
    if (!category) {
      return { gradientFrom: '#6b7280', gradientTo: '#374151' }
    }
    
    // Sempre usar cor do backend (cor_hex sempre existe)
    const rgb = hexToRgb(category.cor_hex)
    if (!rgb) {
      return { gradientFrom: '#6b7280', gradientTo: '#374151' }
    }
    
    // Criar gradient com diferentes opacidades
    const gradientFrom = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` // 100% opacidade
    const gradientTo = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)` // 70% opacidade
    
    return {
      gradientFrom,
      gradientTo,
    }
  }

  // Função para obter nome da categoria
  const getCategoryName = (categoryId?: string) => {
    if (!categoryId || !categories) return 'Sem categoria'
    const category = categories.find(c => c.codigo === categoryId)
    return category?.nome || 'Sem categoria'
  }

  // Função para formatar duração
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'Duração não informada'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`
  }

  if (categoriesError || coursesError) {
    return (
      <DashboardLayout items={navigationItems}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar os dados: {categoriesError?.message || coursesError?.message || 'Erro desconhecido'}
        </Alert>
      </DashboardLayout>
    )
  }

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
        <TextField 
          size='small' 
          placeholder='Buscar cursos...' 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      
      <FilterBar />
      

        <CategoryChips items={processedCategories} />
      

      {/* Carregamento dos cursos */}
      {coursesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {paginatedCourses.map((course) => {
              const gradient = getCourseCardGradient(course.categoria_id)
              return (
                <Grid size={{ xs: 12, md: 4 }} key={course.codigo}>
                  <CourseCard
                    title={course.titulo}
                    category={getCategoryName(course.categoria_id)}
                    hours={formatDuration(course.duracao_estimada)}
                    description={course.descricao}
                    rating={course.avaliacao_media || 0}
                    gradientFrom={gradient.gradientFrom}
                    gradientTo={gradient.gradientTo}
                  />
                </Grid>
              )
            })}
          </Grid>
          
          {/* Paginação */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={(_, page) => setCurrentPage(page)}
                shape='rounded' 
                color='primary' 
              />
            </Box>
          )}
          
          {/* Mensagem quando não há cursos */}
          {courses && courses.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Nenhum curso encontrado
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tente ajustar os filtros ou termos de busca
              </Typography>
            </Box>
          )}
        </>
      )}
    </DashboardLayout>
  )
}
