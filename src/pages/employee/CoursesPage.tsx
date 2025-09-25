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
import SchoolIcon from "@mui/icons-material/School";
import WorkIcon from "@mui/icons-material/Work";
import PsychologyIcon from "@mui/icons-material/Psychology";
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

// Mapeamento de categorias para ícones e cores
const getCategoryStyle = (categoryCodigo: string) => {
  const codigo = categoryCodigo.toLowerCase()

  if (codigo.includes('programação') || codigo.includes('desenvolvimento') || codigo.includes('code') || codigo.includes('software')) {
    return {
      icon: <CodeIcon sx={{ color: '#fff' }} />,
     
    }
  }

  if (codigo.includes('design') || codigo.includes('ui') || codigo.includes('ux')) {
    return {
      icon: <BrushIcon sx={{ color: '#fff' }} />,
      gradientFrom: '#f43f5e',
      gradientTo: '#f97316',
    }
  }

  if (codigo.includes('negócio') || codigo.includes('gestão') || codigo.includes('liderança') || codigo.includes('business')) {
    return {
      icon: <BusinessCenterIcon sx={{ color: '#fff' }} />,
     
    }
  }

  if (codigo.includes('marketing') || codigo.includes('vendas') || codigo.includes('comunicação')) {
    return {
      icon: <CampaignIcon sx={{ color: '#fff' }} />,
     
    }
  }

  if (codigo.includes('ti') || codigo.includes('tecnologia') || codigo.includes('informática') || codigo.includes('it')) {
    return {
      icon: <ComputerIcon sx={{ color: '#fff' }} />,
      
    }
  }

  if (codigo.includes('ciência') || codigo.includes('dados') || codigo.includes('analytics') || codigo.includes('science')) {
    return {
      icon: <ScienceIcon sx={{ color: '#fff' }} />,
     
    }
  }

  if (codigo.includes('idioma') || codigo.includes('língua') || codigo.includes('language') || codigo.includes('inglês')) {
    return {
      icon: <TranslateIcon sx={{ color: '#fff' }} />,
      
    }
  }

  if (codigo.includes('saúde') || codigo.includes('fitness') || codigo.includes('bem-estar') || codigo.includes('health')) {
    return {
      icon: <FavoriteBorderIcon sx={{ color: '#fff' }} />,
      
    }
  }

  if (codigo.includes('rh') || codigo.includes('recursos humanos') || codigo.includes('people')) {
    return {
      icon: <WorkIcon sx={{ color: '#fff' }} />,
     
    }
  }

  if (codigo.includes('psicologia') || codigo.includes('comportamental') || codigo.includes('soft skills')) {
    return {
      icon: <PsychologyIcon sx={{ color: '#fff' }} />,
      
    }
  }
  
  // Default para categorias não mapeadas
  return {
    icon: <SchoolIcon sx={{ color: '#fff' }} />,
    gradientFrom: '#6b7280',
    gradientTo: '#374151',
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

  // Processamento das categorias para o componente CategoryChips
  const processedCategories: TileCategory[] = useMemo(() => {
    if (!categories) return []
    
    return categories.map(category => {
      // Usar cor do backend se disponível, senão usar mapeamento padrão
      let gradientColors
      if (category.cor_hex) {
        // Converter hex para rgb
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : null
        }
        
        const rgb = hexToRgb(category.cor_hex)
        if (rgb) {
          gradientColors = {
            gradientFrom: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
            gradientTo: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`,
          }
        } else {
          const style = getCategoryStyle(category.nome)
          gradientColors = {
            gradientFrom: style.gradientFrom,
            gradientTo: style.gradientTo,
          }
        }
      } else {
        const style = getCategoryStyle(category.nome)
        gradientColors = {
          gradientFrom: style.gradientFrom,
          gradientTo: style.gradientTo,
        }
      }
      
      // Obter ícone baseado no nome da categoria
      const style = getCategoryStyle(category.nome)
      
      // Contar cursos por categoria
      const courseCount = courses?.filter(course => course.categoria_id === category.codigo).length || 0
      
      return {
        label: category.codigo,
        ...gradientColors,
        icon: style.icon,
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
    if (!category || !category.cor_hex) {
      return { gradientFrom: '#6b7280', gradientTo: '#374151' }
    }
    
    // Usar a cor do backend com diferentes opacidades para criar o gradient
    const baseColor = category.cor_hex
    // Converter hex para rgb para aplicar opacidade
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }
    
    const rgb = hexToRgb(baseColor)
    if (!rgb) {
      return { gradientFrom: '#6b7280', gradientTo: '#374151' }
    }
    
    // Criar gradient com a cor original e uma versão mais escura/opaca
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
      
      {/* Carregamento das categorias */}
      {categoriesLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CategoryChips items={processedCategories} />
      )}

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
