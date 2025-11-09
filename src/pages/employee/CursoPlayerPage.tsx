import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Stack,
  Button,
} from '@mui/material'
import {
  CheckCircle,
  Lock,
  PlayCircle,
  RadioButtonUnchecked,
  ArrowBack,
  EmojiEvents,
} from '@mui/icons-material'
import DashboardLayout from '@/components/layout/DashboardLayout'
import ModuloPlayer from '@/components/learning/ModuloPlayer'
import { useNavigation } from '@/hooks/useNavigation'
import { useModulosCompletos } from '@/api/courses'
import { useModulosComProgresso, useProgressoDetalhado } from '@/api/progress'

export default function CursoPlayerPage() {
  const { cursoId, inscricaoId } = useParams<{
    cursoId: string
    inscricaoId: string
  }>()
  const navigate = useNavigate()
  const { navigationItems } = useNavigation()

  const [moduloSelecionado, setModuloSelecionado] = useState<string | null>(
    null
  )

  const { data: modulos = [], isLoading: loadingModulos } = useModulosCompletos(
    cursoId!
  )
  const { data: modulosProgresso = [], isLoading: loadingProgresso } =
    useModulosComProgresso(inscricaoId!)
  const { data: progresso, isLoading: loadingProgressoDetalhado } =
    useProgressoDetalhado(inscricaoId!)

  // Auto-selecionar primeiro módulo não concluído
  useEffect(() => {
    if (!moduloSelecionado && modulosProgresso.length > 0) {
      const proximoModulo = modulosProgresso.find(m => !m.concluido)
      if (proximoModulo) {
        setModuloSelecionado(proximoModulo.modulo_id)
      } else {
        // Todos concluídos, selecionar o primeiro
        setModuloSelecionado(modulosProgresso[0]?.modulo_id)
      }
    }
  }, [modulosProgresso, moduloSelecionado])

  const moduloAtual = modulos.find(m => m.modulo_id === moduloSelecionado)
  const moduloProgressoAtual = modulosProgresso.find(
    m => m.modulo_id === moduloSelecionado
  )

  const handleModuloComplete = () => {
    // Buscar próximo módulo
    const currentIndex = modulosProgresso.findIndex(
      m => m.modulo_id === moduloSelecionado
    )

    if (currentIndex < modulosProgresso.length - 1) {
      // Avançar para próximo
      setModuloSelecionado(modulosProgresso[currentIndex + 1].modulo_id)
    } else {
      // Curso concluído!
      setModuloSelecionado(null)
    }
  }

  const cursoCompleto =
    progresso?.modulos_obrigatorios &&
    progresso.modulos_obrigatorios > 0 &&
    progresso.modulos_obrigatorios === progresso.modulos_obrigatorios_concluidos

  if (loadingModulos || loadingProgresso || loadingProgressoDetalhado) {
    return (
      <DashboardLayout items={navigationItems}>
        <Box sx={{ p: 3 }}>
          <LinearProgress />
        </Box>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout items={navigationItems}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction='row' alignItems='center' spacing={2} mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/employee/courses')}
          >
            Voltar
          </Button>

          <Box flex={1}>
            <Typography variant='h4' gutterBottom>
              {progresso?.curso_titulo}
            </Typography>
            <Stack direction='row' spacing={2} alignItems='center'>
              <Typography variant='body2' color='text.secondary'>
                Progresso: {progresso?.progresso_percentual}%
              </Typography>
              <Chip
                label={`${progresso?.modulos_concluidos} / ${progresso?.total_modulos} módulos`}
                size='small'
              />
            </Stack>
          </Box>
        </Stack>

        {/* Curso Concluído */}
        {cursoCompleto && !moduloSelecionado && (
          <Paper sx={{ p: 6, textAlign: 'center', mb: 3 }}>
            <EmojiEvents sx={{ fontSize: 100, color: 'warning.main', mb: 2 }} />
            <Typography variant='h4' gutterBottom>
              Parabéns! Curso Concluído! 🎉
            </Typography>
            <Typography color='text.secondary' mb={3}>
              Você ganhou{' '}
              <strong>
                {modulos.reduce((sum, m) => sum + m.xp_modulo, 0)} XP
              </strong>{' '}
              total
            </Typography>
            <Stack direction='row' spacing={2} justifyContent='center'>
              <Button
                variant='contained'
                onClick={() => navigate('/employee/certificates')}
              >
                Ver Certificado
              </Button>
              <Button
                variant='outlined'
                onClick={() => navigate('/employee/courses')}
              >
                Voltar aos Cursos
              </Button>
            </Stack>
          </Paper>
        )}

        {/* Layout: Sidebar + Player */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Sidebar - Lista de Módulos */}
          <Paper sx={{ width: 350, flexShrink: 0, p: 2 }}>
            <Typography variant='h6' gutterBottom>
              Módulos
            </Typography>

            <List>
              {modulosProgresso.map((modulo, index) => {
                const isSelected = modulo.modulo_id === moduloSelecionado
                const isConcluido = modulo.concluido
                const isLiberado = modulo.liberado

                return (
                  <ListItem key={modulo.modulo_id} disablePadding>
                    <ListItemButton
                      selected={isSelected}
                      disabled={!isLiberado}
                      onClick={() => setModuloSelecionado(modulo.modulo_id)}
                    >
                      <ListItemIcon>
                        {isConcluido ? (
                          <CheckCircle color='success' />
                        ) : !isLiberado ? (
                          <Lock color='disabled' />
                        ) : isSelected ? (
                          <PlayCircle color='primary' />
                        ) : (
                          <RadioButtonUnchecked />
                        )}
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Typography variant='body2'>
                            {index + 1}. {modulo.titulo}
                          </Typography>
                        }
                        secondary={
                          <Stack direction='row' spacing={0.5} mt={0.5}>
                            {modulo.obrigatorio && (
                              <Chip
                                label='Obrigatório'
                                size='small'
                                color='error'
                                variant='outlined'
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                            <Chip
                              label={`${modulo.xp_modulo} XP`}
                              size='small'
                              sx={{ height: 20, fontSize: '0.7rem' }}
                            />
                          </Stack>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>

            {/* Progress Summary */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              <Typography variant='caption' color='text.secondary'>
                Progresso Geral
              </Typography>
              <LinearProgress
                variant='determinate'
                value={progresso?.progresso_percentual || 0}
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant='caption'>
                {progresso?.modulos_concluidos} de {progresso?.total_modulos}{' '}
                concluídos
              </Typography>
            </Box>
          </Paper>

          {/* Player de Módulo */}
          <Box sx={{ flex: 1 }}>
            {moduloAtual && moduloProgressoAtual ? (
              <ModuloPlayer
                modulo={moduloAtual}
                inscricaoId={inscricaoId!}
                liberado={moduloProgressoAtual.liberado}
                concluido={moduloProgressoAtual.concluido}
                onComplete={handleModuloComplete}
                onBack={() => setModuloSelecionado(null)}
              />
            ) : (
              <Paper sx={{ p: 6, textAlign: 'center' }}>
                <Typography variant='h6' color='text.secondary'>
                  Selecione um módulo para começar
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  )
}
