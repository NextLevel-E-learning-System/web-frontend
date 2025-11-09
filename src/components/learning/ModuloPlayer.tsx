import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  LinearProgress,
  Paper,
  Alert,
  Chip,
  Stack,
} from '@mui/material'
import {
  CheckCircle,
  Lock,
  PlayCircle,
  Quiz,
  Article,
  PictureAsPdf,
} from '@mui/icons-material'
import VideoPlayer from '../learning/VideoPlayer'
import QuizPlayer from '../learning/QuizPlayer'
import type { ModuloCompleto } from '@/api/courses'
import {
  useMarcarConteudoVisualizado,
  useMarcarModuloConcluido,
} from '@/api/progress'

interface ModuloPlayerProps {
  modulo: ModuloCompleto
  inscricaoId: string
  liberado: boolean
  concluido: boolean
  onComplete: () => void
  onBack?: () => void
}

export default function ModuloPlayer({
  modulo,
  inscricaoId,
  liberado,
  concluido,
  onComplete,
  onBack,
}: ModuloPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [tempoInicio, setTempoInicio] = useState<number>(Date.now())

  const marcarVisualizadoMutation = useMarcarConteudoVisualizado()
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

  // Marcar como visualizado ao montar
  useEffect(() => {
    if (liberado && !concluido) {
      marcarVisualizadoMutation.mutate({
        inscricaoId,
        moduloId: modulo.modulo_id,
        tipoConteudo: modulo.tipo_conteudo || undefined,
      })
      setTempoInicio(Date.now())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liberado, concluido, inscricaoId, modulo.modulo_id, modulo.tipo_conteudo])

  const handleStepComplete = () => {
    setCompletedSteps(prev => new Set(prev).add(currentStep))

    // Se for o último step, marcar módulo como concluído
    if (currentStep === steps.length - 1) {
      const tempoGasto = Math.floor((Date.now() - tempoInicio) / 1000)

      marcarConcluidoMutation.mutate(
        {
          inscricaoId,
          moduloId: modulo.modulo_id,
          tempoGasto,
        },
        {
          onSuccess: () => {
            onComplete()
          },
        }
      )
    } else {
      // Avançar para próximo step
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleStepComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      onBack?.()
    }
  }

  const progress =
    steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0

  if (!liberado) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Lock sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant='h6' gutterBottom>
          Módulo Bloqueado
        </Typography>
        <Typography color='text.secondary'>
          Complete os módulos anteriores para desbloquear este conteúdo
        </Typography>
      </Paper>
    )
  }

  if (concluido) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant='h6' gutterBottom>
          Módulo Concluído!
        </Typography>
        <Typography color='text.secondary' gutterBottom>
          Você ganhou <strong>{modulo.xp_modulo} XP</strong>
        </Typography>
        <Button variant='outlined' onClick={onComplete} sx={{ mt: 2 }}>
          Próximo Módulo
        </Button>
      </Paper>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='space-between'
          mb={2}
        >
          <Box>
            <Typography variant='h5' gutterBottom>
              {modulo.titulo}
            </Typography>
            <Stack direction='row' spacing={1}>
              <Chip
                label={modulo.tipo_conteudo || 'material'}
                size='small'
                color='primary'
                variant='outlined'
              />
              {modulo.obrigatorio && (
                <Chip label='Obrigatório' size='small' color='error' />
              )}
              <Chip label={`${modulo.xp_modulo} XP`} size='small' />
            </Stack>
          </Box>

          <Box textAlign='right'>
            <Typography variant='h6'>{Math.round(progress)}%</Typography>
            <Typography variant='caption' color='text.secondary'>
              {completedSteps.size} de {steps.length} concluídos
            </Typography>
          </Box>
        </Stack>

        <LinearProgress variant='determinate' value={progress} />
      </Paper>

      {/* Stepper (se houver múltiplos steps) */}
      {steps.length > 1 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={index} completed={completedSteps.has(index)}>
                <StepLabel icon={step.icon}>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      )}

      {/* Conteúdo do step atual */}
      <Paper sx={{ p: 3, mb: 3, minHeight: 400 }}>
        {currentStepData?.type === 'material' &&
          currentStepData.data.tipo_arquivo?.includes('video') && (
            <VideoPlayer
              material={currentStepData.data}
              onEnded={handleStepComplete}
              autoMarkComplete={modulo.obrigatorio}
            />
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
              <Alert severity='info' sx={{ mt: 2 }}>
                Após ler o material, clique em "Próximo" para continuar
              </Alert>
            </Box>
          )}

        {currentStepData?.type === 'texto' && (
          <Box>
            <div
              dangerouslySetInnerHTML={{ __html: currentStepData.data }}
              style={{ minHeight: 300 }}
            />
            <Alert severity='info' sx={{ mt: 2 }}>
              Após ler o conteúdo, clique em "Próximo" para continuar
            </Alert>
          </Box>
        )}

        {currentStepData?.type === 'quiz' && (
          <QuizPlayer
            avaliacaoId={currentStepData.data.codigo}
            funcionarioId={inscricaoId}
            onComplete={(aprovado, nota) => {
              if (aprovado) {
                handleStepComplete()
              } else {
                // Reprovar - mostrar mensagem de erro
                alert(
                  `Você não atingiu a nota mínima. Nota obtida: ${nota.toFixed(1)}`
                )
              }
            }}
            onCancel={onBack}
          />
        )}
      </Paper>

      {/* Navegação */}
      <Paper sx={{ p: 2 }}>
        <Stack direction='row' justifyContent='space-between'>
          <Button onClick={handleBack} disabled={currentStep === 0 && !onBack}>
            Voltar
          </Button>

          <Button
            variant='contained'
            onClick={handleNext}
            disabled={modulo.obrigatorio && !completedSteps.has(currentStep)}
          >
            {currentStep === steps.length - 1 ? 'Concluir Módulo' : 'Próximo'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
