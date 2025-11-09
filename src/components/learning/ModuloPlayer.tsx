import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  Stack,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  CheckCircle,
  PlayCircle,
  Quiz,
  Article,
  PictureAsPdf,
  ArrowBack,
} from '@mui/icons-material'
import VideoPlayer from '../learning/VideoPlayer'
import QuizPlayer from '../learning/QuizPlayer'
import type { ModuloCompleto } from '@/api/courses'
import { useMarcarModuloConcluido } from '@/api/progress'

interface ModuloPlayerProps {
  modulo: ModuloCompleto
  inscricaoId: string
  concluido: boolean
  onComplete: () => void
  onBack?: () => void
}

export default function ModuloPlayer({
  modulo,
  inscricaoId,
  concluido,
  onComplete,
  onBack,
}: ModuloPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tempoInicio] = useState<number>(Date.now())

  const queryClient = useQueryClient()
  const marcarConcluidoMutation = useMarcarModuloConcluido()

  // Construir steps (materiais + avaliação + conteúdo texto)
  type StepData =
    | {
        type: 'material'
        index: number
        label: string
        icon: JSX.Element
        data: ModuloCompleto['materiais'][0]
      }
    | {
        type: 'texto'
        index: number
        label: string
        icon: JSX.Element
        data: string
      }
    | {
        type: 'quiz'
        index: number
        label: string
        icon: JSX.Element
        data: NonNullable<ModuloCompleto['avaliacao']>
      }

  const steps: StepData[] = []

  // Adicionar materiais
  modulo.materiais.forEach((material, idx) => {
    steps.push({
      type: 'material' as const,
      index: idx,
      label: material.nome_arquivo,
      icon: material.tipo_arquivo.includes('video') ? (
        <PlayCircle />
      ) : material.tipo_arquivo.includes('pdf') ? (
        <PictureAsPdf />
      ) : (
        <Article />
      ),
      data: material,
    })
  })

  // Adicionar conteúdo texto se existir
  if (modulo.conteudo && !modulo.materiais.length && !modulo.avaliacao) {
    steps.push({
      type: 'texto' as const,
      index: 0,
      label: 'Conteúdo',
      icon: <Article />,
      data: modulo.conteudo,
    })
  }

  // Adicionar avaliação se existir
  if (modulo.avaliacao) {
    steps.push({
      type: 'quiz' as const,
      index: 0,
      label: modulo.avaliacao.titulo,
      icon: <Quiz />,
      data: modulo.avaliacao,
    })
  }

  const currentStepData = steps[currentStep]

  const handleCompleteModule = () => {
    const tempoGasto = Math.floor((Date.now() - tempoInicio) / 60000) // Converter para minutos

    marcarConcluidoMutation.mutate(
      {
        inscricaoId,
        moduloId: modulo.modulo_id,
        tempoGasto,
      },
      {
        onSuccess: () => {
          // Invalidar queries para atualizar dados
          queryClient.invalidateQueries({
            queryKey: ['progress', 'modulos-progresso', inscricaoId],
          })
          queryClient.invalidateQueries({
            queryKey: ['progress', 'user'],
          })
          queryClient.invalidateQueries({
            queryKey: ['users', 'dashboard'],
          })
          onComplete()
        },
      }
    )
  }

  const handleBack = () => {
    // Invalidar queries para atualizar dados ao voltar
    queryClient.invalidateQueries({
      queryKey: ['progress', 'modulos-progresso', inscricaoId],
    })
    queryClient.invalidateQueries({
      queryKey: ['progress', 'user'],
    })
    onBack?.()
  }

  return (
    <Box>
      {/* Header com botões */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
        >
          <Stack direction='row' spacing={2}>
            <Typography variant='h5' fontWeight={600}>
              {modulo.titulo}
            </Typography>
            {concluido && (
              <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
            )}
          </Stack>

          <Stack direction='row' spacing={2} alignItems='center'>
            <Button
              onClick={handleBack}
              startIcon={<ArrowBack />}
              variant='outlined'
            >
              Voltar
            </Button>
            <Button
              variant='contained'
              onClick={concluido ? onComplete : handleCompleteModule}
              disabled={!concluido && marcarConcluidoMutation.isPending}
            >
              Próximo Módulo
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Layout: Sidebar + Conteúdo */}
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        {/* Sidebar com lista de materiais */}
        {steps.length > 1 && (
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 500,
              }}
            >
              <Typography variant='subtitle2' color='text.secondary' mb={2}>
                CONTEÚDO DO MÓDULO
              </Typography>
              <List sx={{ flex: 1, overflow: 'auto' }}>
                {steps.map((step, index) => (
                  <ListItemButton
                    key={index}
                    selected={currentStep === index}
                    onClick={() => setCurrentStep(index)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {step.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={step.label}
                      primaryTypographyProps={{
                        variant: 'body2',
                        noWrap: true,
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Conteúdo do step atual */}
        <Grid size={{ xs: 12, md: steps.length > 1 ? 9 : 12 }}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {currentStepData?.type === 'material' &&
              currentStepData.data.tipo_arquivo?.includes('video') && (
                <VideoPlayer material={currentStepData.data} />
              )}

            {currentStepData?.type === 'material' &&
              currentStepData.data.tipo_arquivo?.includes('pdf') && (
                <Box>
                  <Typography variant='h6' gutterBottom>
                    {currentStepData.data.nome_arquivo}
                  </Typography>
                  {currentStepData.data.url_download ? (
                    <iframe
                      src={currentStepData.data.url_download}
                      style={{
                        width: '100%',
                        height: '80vh',
                        border: 'none',
                      }}
                      title={currentStepData.data.nome_arquivo}
                    />
                  ) : (
                    <Alert severity='error'>
                      URL do material não disponível. Por favor, recarregue a
                      página.
                    </Alert>
                  )}
                </Box>
              )}

            {currentStepData?.type === 'texto' && (
              <Box>
                <div
                  dangerouslySetInnerHTML={{ __html: currentStepData.data }}
                  style={{ minHeight: 300 }}
                />
              </Box>
            )}

            {currentStepData?.type === 'quiz' && (
              <QuizPlayer
                avaliacaoId={currentStepData.data.codigo}
                funcionarioId={inscricaoId}
                onComplete={aprovado => {
                  if (aprovado) {
                    // Quiz aprovado, pode concluir módulo
                    handleCompleteModule()
                  }
                }}
                onCancel={onBack}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
