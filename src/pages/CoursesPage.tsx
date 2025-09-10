import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  useTheme,
  useMediaQuery,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Grade as GradeIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  ContentCopy as CopyIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Star as StarIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Code as CodeIcon,
  Palette as PaletteIcon,
  Business as BusinessIcon,
  Security as SecurityIcon,
  Computer as ComputerIcon,
  Psychology as PsychologyIcon,
  Language as LanguageIcon,
  Engineering as EngineeringIcon,
  Analytics as AnalyticsIcon,
  CameraAlt as CameraAltIcon,
  Book as BookIcon,
  EmojiEvents as EmojiEventsIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  School as GraduationCapIcon,
  People as PeopleIcon,
  Badge as BadgeIcon,
  Apartment as ApartmentIcon,
} from '@mui/icons-material'
import DashboardLayout, { NavItem } from '@/components/layout/DashboardLayout'
import { useMeuPerfil } from '@/hooks/users'
import { useNavigation } from '@/hooks/useNavigation'
import {
  useCatalogoCursos,
  useCategorias,
  useCriarCurso,
  useDuplicarCurso,
  useAlterarStatusCurso,
  useValidacoesCurso,
  type Curso,
  type CriarCurso,
  type FiltrosCatalogo,
} from '@/hooks/courses'
import {
  useProgressoCompleto,
  useCriarInscricao,
  useVerificarInscricao,
} from '@/hooks/progress'

export default function CoursesPage() {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const { data: user } = useMeuPerfil()
  const { navigationItems, canManageCourses, isFuncionario, isInstrutor, isAdmin } = useNavigation()

  // Estados locais
  const [filtros, setFiltros] = useState<FiltrosCatalogo>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [dialogCriarCurso, setDialogCriarCurso] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [dadosNovoCurso, setDadosNovoCurso] = useState<CriarCurso>({
    codigo: '',
    titulo: '',
    descricao: '',
    categoria_id: '',
    instrutor_id: user?.id || '',
    duracao_estimada: 0,
    xp_oferecido: 0,
    nivel_dificuldade: 'Básico',
  })

  // Hooks
  const { data: categorias, isLoading: loadingCategorias } = useCategorias()
  const { data: cursos, isLoading: loadingCursos } = useCatalogoCursos(filtros)
  const { inscricoes } = useProgressoCompleto(user?.id || '', !!user?.id)
  const criarCursoMutation = useCriarCurso()
  const duplicarCursoMutation = useDuplicarCurso()
  const alterarStatusMutation = useAlterarStatusCurso()
  const criarInscricaoMutation = useCriarInscricao()
  const { validarCodigo, validarTitulo } = useValidacoesCurso()

  // Hook para buscar todos os cursos (sem filtros) para contagem por categoria
  const { data: todosCursos } = useCatalogoCursos()

  // Função para contar cursos por categoria
  const getContagemCursosPorCategoria = (categoriaId: string): number => {
    if (!todosCursos) return 0
    return todosCursos.filter(curso => 
      curso.categoria_id === categoriaId 
    ).length
  }

  const dificuldadeColors = {
    Básico: '#4caf50',
    Intermediário: '#ff9800',
    Avançado: '#f44336',
  }

  // Atualizar filtros automaticamente quando categoria é selecionada
  useEffect(() => {
    setFiltros(prev => ({
      ...prev,
      categoria: selectedCategory || undefined,
    }))
  }, [selectedCategory])

  const handleSearch = () => {
    setFiltros(prev => ({
      ...prev,
      categoria: selectedCategory || undefined,
    }))
  }

  const handleCriarCurso = async () => {
    try {
      await criarCursoMutation.mutateAsync(dadosNovoCurso)
      setMensagem('Curso criado com sucesso!')
      setDialogCriarCurso(false)
      resetFormCurso()
    } catch (error) {
      setMensagem('Erro ao criar curso')
    }
  }

  const handleDuplicarCurso = async (codigo: string) => {
    try {
      await duplicarCursoMutation.mutateAsync(codigo)
      setMensagem('Curso duplicado com sucesso!')
    } catch (error) {
      setMensagem('Erro ao duplicar curso')
    }
  }

  const handleToggleStatus = async (codigo: string, ativo: boolean) => {
    try {
      await alterarStatusMutation.mutateAsync({ codigo, active: !ativo })
      setMensagem(`Curso ${!ativo ? 'ativado' : 'desativado'} com sucesso!`)
    } catch (error) {
      setMensagem('Erro ao alterar status do curso')
    }
  }

  const handleInscrever = async (cursoId: string) => {
    if (!user?.id) return

    try {
      await criarInscricaoMutation.mutateAsync({
        funcionario_id: user.id,
        curso_id: cursoId,
      })
      setMensagem('Inscrição realizada com sucesso!')
    } catch (error) {
      setMensagem('Erro ao realizar inscrição')
    }
  }

  const resetFormCurso = () => {
    setDadosNovoCurso({
      codigo: '',
      titulo: '',
      descricao: '',
      categoria_id: '',
      instrutor_id: user?.id || '',
      duracao_estimada: 0,
      xp_oferecido: 0,
      nivel_dificuldade: 'Básico',
    })
  }

  const getInscricaoStatus = (cursoId: string) => {
    return inscricoes?.find(i => i.curso_id === cursoId)
  }

  const renderCategoriaCard = (categoria: any) => (
    <Box
      key={categoria.codigo}
      sx={{
        width: { xs: '100%', sm: '50%', md: '33.33%', lg: '20%' },
        p: 1,
      }}
    >
      <Card
        sx={{
          height: 180,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          border: '1px solid #EAEAEA',
          bgcolor: 'transparent',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.10)',
            transform: 'translateY(-2px)',
          },
        }}
        onClick={() => {
          setSelectedCategory(categoria.codigo)
        }}
      >
        {/* Header com cor da categoria */}
        <Box
          sx={{
            height: 80,
            background: categoria.cor_hex || '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <Typography
            variant='h6'
            sx={{
              fontFamily: 'Exo, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#FFF',
              textAlign: 'center',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            {categoria.nome}
          </Typography>
        </Box>

        {/* Conteúdo do card */}
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 2,
            flexGrow: 1,
          }}
        >
          <Typography
            variant='body2'
            sx={{
              fontFamily: 'Jost, -apple-system, Roboto, Helvetica, sans-serif',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: 1.5,
              color: '#666',
              textAlign: 'center',
            }}
          >
            {getContagemCursosPorCategoria(categoria.id || categoria.codigo)} Cursos
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )

  const renderCursoCard = (curso: Curso) => {
    const inscricao = getInscricaoStatus(curso.codigo)
    const isInscrito = !!inscricao
    const isCompleto = inscricao?.status === 'CONCLUIDO'
    const progresso = inscricao?.progresso_percentual || 0

    return (
      <Box
        key={curso.codigo}
        sx={{
          width: { xs: '100%', sm: '50%', lg: '33.33%' },
          p: 1,
        }}
      >
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '20px',
            border: '1px solid #EAEAEA',
            bgcolor: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.10)',
              bgcolor: '#FFF',
            },
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                height: 200,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px 20px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolIcon sx={{ fontSize: 60, color: 'white', opacity: 0.8 }} />
            </Box>

            <Chip
              label={curso.categoria_nome || 'Categoria'}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                bgcolor: '#000',
                color: '#FFF',
                fontFamily:
                  'Jost, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px',
                fontWeight: 400,
                borderRadius: '8px',
                height: 'auto',
                py: 0.5,
                px: 1,
              }}
            />

            {curso.nivel_dificuldade && (
              <Chip
                label={curso.nivel_dificuldade}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  bgcolor: dificuldadeColors[curso.nivel_dificuldade],
                  color: '#FFF',
                  fontSize: '12px',
                  height: 'auto',
                  py: 0.5,
                  px: 1,
                }}
              />
            )}

            {/* Status de progresso */}
            {isInscrito && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  bgcolor: 'rgba(0,0,0,0.8)',
                  borderRadius: '12px',
                  px: 1,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {isCompleto ? (
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#4caf50' }} />
                ) : (
                  <PlayArrowIcon sx={{ fontSize: 16, color: '#2196f3' }} />
                )}
                <Typography sx={{ fontSize: '12px', color: 'white' }}>
                  {isCompleto ? 'Concluído' : `${progresso}%`}
                </Typography>
              </Box>
            )}
          </Box>

          <CardContent
            sx={{
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Typography
                variant='body2'
                sx={{
                  fontFamily:
                    'Jost, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: '#555',
                  mb: 1,
                }}
              >
                por{' '}
                <span style={{ color: '#000' }}>
                  {curso.instrutor_nome || 'Instrutor'}
                </span>
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  fontFamily:
                    'Exo, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: '#000',
                  textTransform: 'capitalize',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {curso.titulo}
              </Typography>
            </Box>

            <Typography
              variant='body2'
              sx={{
                fontFamily:
                  'Jost, -apple-system, Roboto, Helvetica, sans-serif',
                fontSize: '14px',
                color: '#666',
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {curso.descricao || 'Descrição do curso...'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {curso.duracao_estimada && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: '16px', color: '#FF782D' }} />
                  <Typography
                    variant='body2'
                    sx={{ fontSize: '14px', color: '#555' }}
                  >
                    {curso.duracao_estimada}h
                  </Typography>
                </Box>
              )}
              {curso.xp_oferecido && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <StarIcon sx={{ fontSize: '16px', color: '#FF782D' }} />
                  <Typography
                    variant='body2'
                    sx={{ fontSize: '14px', color: '#555' }}
                  >
                    {curso.xp_oferecido} XP
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Progresso para usuários inscritos */}
            {isInscrito && !isCompleto && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant='body2'
                  sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}
                >
                  Progresso
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={progresso}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            )}

            <Box sx={{ borderTop: '1px solid #EAEAEA', pt: 2, mt: 'auto' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {/* Botões para funcionários */}
                {isFuncionario && (
                  <Button
                    variant={isInscrito ? 'outlined' : 'contained'}
                    size='small'
                    disabled={isCompleto || criarInscricaoMutation.isPending}
                    onClick={e => {
                      e.stopPropagation()
                      if (!isInscrito) {
                        handleInscrever(curso.codigo)
                      }
                    }}
                    sx={{
                      borderRadius: '20px',
                      textTransform: 'none',
                      fontSize: '14px',
                    }}
                  >
                    {isCompleto
                      ? 'Concluído'
                      : isInscrito
                        ? 'Continuar'
                        : 'Inscrever-se'}
                  </Button>
                )}

                {/* Botões para instrutores/admins */}
                {canManageCourses && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title='Visualizar'>
                      <IconButton size='small'>
                        <VisibilityIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Editar'>
                      <IconButton size='small'>
                        <EditIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Duplicar'>
                      <IconButton
                        size='small'
                        onClick={e => {
                          e.stopPropagation()
                          handleDuplicarCurso(curso.codigo)
                        }}
                        disabled={duplicarCursoMutation.isPending}
                      >
                        <CopyIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                <Typography
                  variant='body2'
                  sx={{
                    fontFamily:
                      'Jost, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#FF782D',
                    cursor: 'pointer',
                    '&:hover': {
                      color: '#e64a19',
                    },
                  }}
                >
                  Ver mais
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <DashboardLayout title= {isFuncionario ? 'Catálogo de Cursos' : 'Gerenciar Cursos'} items={navigationItems}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 4, md: 6 } }}
      >
        
            {canManageCourses && (
              <Button
                variant='contained'
                startIcon={<AddIcon />}
                onClick={() => setDialogCriarCurso(true)}
                sx={{
                  borderRadius: '24px',
                  textTransform: 'none',
                  fontSize: '16px',
                  px: 3,
                  py: 1.5,
                }}
              >
                Novo Curso
              </Button>
            )}
       

        {/* Seção de Categorias */}
        {loadingCategorias && <LinearProgress sx={{ mb: 2 }} />}
        {categorias && categorias.length > 0 && (
          <Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Box>
                <Typography
                  variant='h5'
                  fontWeight={700}
                  sx={{
                    fontFamily:
                      'Exo, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: { xs: '20px', md: '24px' },
                    color: '#000',
                    mb: 1,
                  }}
                >
                  Categorias
                </Typography>
                <Typography
                  variant='body1'
                  sx={{
                    fontFamily:
                      'Jost, -apple-system, Roboto, Helvetica, sans-serif',
                    fontSize: '16px',
                    color: '#555',
                  }}
                >
                  Explore nossos cursos por categoria
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              {categorias?.map(renderCategoriaCard)}
            </Box>
          </Box>
        )}

        {/* Loading */}
        {loadingCursos && <LinearProgress sx={{ mb: 2 }} />}

        {/* Seção de Cursos */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant='h5'
                fontWeight={700}
                sx={{
                  fontFamily:
                    'Exo, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: { xs: '20px', md: '24px' },
                  color: '#000',
                  mb: 1,
                }}
              >
                {selectedCategory ? 'Cursos Filtrados' : 'Todos os Cursos'}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  fontFamily:
                    'Jost, -apple-system, Roboto, Helvetica, sans-serif',
                  fontSize: '16px',
                  color: '#555',
                }}
              >
                {cursos?.length || 0} curso(s) encontrado(s)
              </Typography>
            </Box>

            {selectedCategory && (
              <Button
                variant='outlined'
                onClick={() => {
                  setSelectedCategory('')
                  setFiltros({})
                }}
                sx={{ borderRadius: '20px', textTransform: 'none' }}
              >
                Limpar filtros
              </Button>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            {cursos?.map(renderCursoCard)}
          </Box>

          {cursos?.length === 0 && !loadingCursos && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SchoolIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant='h6' sx={{ color: '#666', mb: 1 }}>
                Nenhum curso encontrado
              </Typography>
              <Typography variant='body2' sx={{ color: '#999' }}>
                Tente ajustar os filtros ou criar um novo curso
              </Typography>
            </Box>
          )}
        </Box>

        {/* FAB para criar curso (mobile) */}
        {canManageCourses && !isMdUp && (
          <Fab
            color='primary'
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => setDialogCriarCurso(true)}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>

      {/* Dialog para criar curso */}
      <Dialog
        open={dialogCriarCurso}
        onClose={() => setDialogCriarCurso(false)}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>Novo Curso</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label='Código'
              value={dadosNovoCurso.codigo}
              onChange={e =>
                setDadosNovoCurso(prev => ({ ...prev, codigo: e.target.value }))
              }
              error={
                dadosNovoCurso.codigo.length > 0 &&
                !validarCodigo(dadosNovoCurso.codigo)
              }
              helperText={
                dadosNovoCurso.codigo.length > 0 &&
                !validarCodigo(dadosNovoCurso.codigo)
                  ? 'Código deve ter pelo menos 3 caracteres e conter apenas letras, números, _ ou -'
                  : ''
              }
              required
            />

            <TextField
              label='Título'
              value={dadosNovoCurso.titulo}
              onChange={e =>
                setDadosNovoCurso(prev => ({ ...prev, titulo: e.target.value }))
              }
              error={
                dadosNovoCurso.titulo.length > 0 &&
                !validarTitulo(dadosNovoCurso.titulo)
              }
              helperText={
                dadosNovoCurso.titulo.length > 0 &&
                !validarTitulo(dadosNovoCurso.titulo)
                  ? 'Título deve ter pelo menos 5 caracteres'
                  : ''
              }
              required
            />

            <TextField
              label='Descrição'
              value={dadosNovoCurso.descricao}
              onChange={e =>
                setDadosNovoCurso(prev => ({
                  ...prev,
                  descricao: e.target.value,
                }))
              }
              multiline
              rows={3}
            />

            <FormControl>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={dadosNovoCurso.categoria_id}
                label='Categoria'
                onChange={e =>
                  setDadosNovoCurso(prev => ({
                    ...prev,
                    categoria_id: e.target.value,
                  }))
                }
              >
                {categorias?.map(categoria => (
                  <MenuItem key={categoria.codigo} value={categoria.codigo}>
                    {categoria.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <InputLabel>Nível de Dificuldade</InputLabel>
              <Select
                value={dadosNovoCurso.nivel_dificuldade}
                label='Nível de Dificuldade'
                onChange={e =>
                  setDadosNovoCurso(prev => ({
                    ...prev,
                    nivel_dificuldade: e.target.value as
                      | 'Básico'
                      | 'Intermediário'
                      | 'Avançado',
                  }))
                }
              >
                <MenuItem value='Básico'>Básico</MenuItem>
                <MenuItem value='Intermediário'>Intermediário</MenuItem>
                <MenuItem value='Avançado'>Avançado</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label='Duração (horas)'
                type='number'
                value={dadosNovoCurso.duracao_estimada}
                onChange={e =>
                  setDadosNovoCurso(prev => ({
                    ...prev,
                    duracao_estimada: parseInt(e.target.value) || 0,
                  }))
                }
                sx={{ flex: 1 }}
              />

              <TextField
                label='XP Oferecido'
                type='number'
                value={dadosNovoCurso.xp_oferecido}
                onChange={e =>
                  setDadosNovoCurso(prev => ({
                    ...prev,
                    xp_oferecido: parseInt(e.target.value) || 0,
                  }))
                }
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogCriarCurso(false)}>Cancelar</Button>
          <Button
            onClick={handleCriarCurso}
            variant='contained'
            disabled={
              criarCursoMutation.isPending ||
              !validarCodigo(dadosNovoCurso.codigo) ||
              !validarTitulo(dadosNovoCurso.titulo)
            }
          >
            {criarCursoMutation.isPending ? 'Criando...' : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens */}
      <Snackbar
        open={!!mensagem}
        autoHideDuration={4000}
        onClose={() => setMensagem('')}
      >
        <Alert severity={mensagem.includes('sucesso') ? 'success' : 'error'}>
          {mensagem}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  )
}
