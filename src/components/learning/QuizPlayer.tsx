import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  LinearProgress,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  TextField,
} from '@mui/material'
import { Timer, NavigateNext, NavigateBefore } from '@mui/icons-material'
import {
  useStartAssessment,
  useSubmitAssessment,
  useActiveAttempt,
  type StartAssessmentResponse,
} from '@/api/assessments'
import { useCompleteModule } from '@/api/progress'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

interface AvaliacaoInfo {
  codigo: string
  titulo: string
  tempo_limite: number
  tentativas_permitidas: number
  nota_minima: number
  ativo: boolean
}

interface QuizPlayerProps {
  avaliacaoId: string
  avaliacaoInfo?: AvaliacaoInfo
  inscricaoId?: string
  moduloId?: string
  onComplete: (aprovado: boolean) => void
}

export default function QuizPlayer({
  avaliacaoId,
  avaliacaoInfo,
  inscricaoId,
  moduloId,
  onComplete,
}: QuizPlayerProps) {
  const queryClient = useQueryClient()
  const startAssessment = useStartAssessment()
  const submitAssessment = useSubmitAssessment()
  const completeModule = useCompleteModule()

  // Buscar tentativa ativa ao montar o componente
  const { data: activeAttempt } = useActiveAttempt(avaliacaoId, true)

  const [assessmentData, setAssessmentData] =
    useState<StartAssessmentResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tentativaStarted, setTentativaStarted] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!assessmentData) return

    // Verificar se todas as questões foram respondidas
    const unanswered = assessmentData.questoes.filter(q => !respostas[q.id])
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `Você tem ${unanswered.length} questão(ões) não respondida(s). Deseja enviar mesmo assim?`
      )
      if (!confirm) return
    }

    setIsSubmitting(true)

    try {
      const result = await submitAssessment.mutateAsync({
        tentativa_id: assessmentData.tentativa.id,
        respostas: Object.entries(respostas).map(([questao_id, resposta]) => ({
          questao_id,
          resposta_funcionario: resposta,
        })),
      })

      // Se aprovado E temos inscrição + módulo, completar o módulo automaticamente
      if (result.status === 'APROVADO' && inscricaoId && moduloId) {
        await completeModule.mutateAsync({
          enrollmentId: inscricaoId,
          moduleId: moduloId,
        })

        // Invalidar cache relevante
        queryClient.invalidateQueries({
          queryKey: ['progress', 'modulos-progresso', inscricaoId],
        })
        queryClient.invalidateQueries({ queryKey: ['progress', 'user'] })
        queryClient.invalidateQueries({ queryKey: ['users', 'dashboard'] })

        toast.success('🎉 Quiz concluído e módulo marcado como completo!')
        onComplete(true)
      } else if (result.status === 'APROVADO') {
        toast.success('🎉 Quiz concluído com sucesso!')
        onComplete(true)
      } else {
        toast.info('Quiz enviado para correção')
        onComplete(false)
      }

      // Resetar estado
      setTentativaStarted(false)
      setAssessmentData(null)
      setRespostas({})
      setCurrentQuestionIndex(0)
      setTimeRemaining(null)
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || 'Erro ao enviar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }, [
    assessmentData,
    respostas,
    submitAssessment,
    inscricaoId,
    moduloId,
    completeModule,
    queryClient,
    onComplete,
  ])

  // Recuperar tentativa ativa se existir
  useEffect(() => {
    if (activeAttempt && !assessmentData) {
      console.log('🔄 Recuperando tentativa ativa:', activeAttempt)
      setAssessmentData(activeAttempt)
      setTentativaStarted(true)

      // Calcular tempo restante se houver tempo limite
      if (
        activeAttempt.avaliacao.tempo_limite &&
        activeAttempt.tentativa.data_inicio
      ) {
        const inicioMs = new Date(activeAttempt.tentativa.data_inicio).getTime()
        const agoraMs = Date.now()
        const decorrido = Math.floor((agoraMs - inicioMs) / 1000)
        const limiteSegundos = activeAttempt.avaliacao.tempo_limite * 60
        const restante = limiteSegundos - decorrido

        if (restante > 0) {
          setTimeRemaining(restante)
        } else {
          // Tempo esgotado, submeter automaticamente
          toast.warning(
            'Tempo esgotado! Submetendo respostas automaticamente...'
          )
          setTimeout(() => handleSubmit(), 1000)
        }
      }
    }
  }, [activeAttempt, assessmentData, handleSubmit])

  // Handler para iniciar a tentativa
  const handleStartTentativa = async () => {
    try {
      const result = await startAssessment.mutateAsync(avaliacaoId)
      console.log('📝 Tentativa iniciada:', result)
      setAssessmentData(result)
      setTentativaStarted(true)

      // Configurar timer se houver tempo limite
      if (result.avaliacao.tempo_limite) {
        setTimeRemaining(result.avaliacao.tempo_limite * 60)
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao iniciar tentativa:', error)
      const err = error as {
        message?: string
        response?: {
          data?: {
            message?: string
            error?: string
            details?: { message?: string; incomplete_modules?: string[] }
          }
        }
      }

      const errorDetails = err.response?.data?.details
      const errorMessage =
        errorDetails?.message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message

      if (
        errorDetails?.incomplete_modules &&
        errorDetails.incomplete_modules.length > 0
      ) {
        toast.error(
          `❌ ${errorMessage}\n\nMódulos pendentes:\n${errorDetails.incomplete_modules.join('\n')}`,
          { autoClose: 10000 }
        )
      } else {
        toast.error(errorMessage || 'Erro ao iniciar tentativa')
      }
    }
  }

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questaoId: string, resposta: string) => {
    setRespostas(prev => ({ ...prev, [questaoId]: resposta }))
  }

  return (
    <Box>
      <Typography variant='h5' gutterBottom fontWeight={600}>
        {avaliacaoInfo?.titulo || 'Avaliação'}
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* Informações da avaliação */}
      {avaliacaoInfo && !tentativaStarted && (
        <Paper variant='outlined' sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            <Typography variant='h6' fontWeight={600}>
              Informações da Avaliação
            </Typography>
            <Stack direction='row' spacing={3} flexWrap='wrap'>
              <Chip
                label={`⏱️ ${avaliacaoInfo.tempo_limite || 'Sem limite'} min`}
                color='primary'
                variant='outlined'
              />
              <Chip
                label={`📝 ${avaliacaoInfo.tentativas_permitidas || '∞'} tentativas`}
                color='secondary'
                variant='outlined'
              />
              <Chip
                label={`✅ Nota mínima: ${avaliacaoInfo.nota_minima}%`}
                color='success'
                variant='outlined'
              />
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Botão de iniciar */}
      {!tentativaStarted && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Button
            variant='contained'
            size='large'
            onClick={handleStartTentativa}
            disabled={startAssessment.isPending}
            sx={{ minWidth: 200 }}
          >
            {startAssessment.isPending ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              'Iniciar Avaliação'
            )}
          </Button>
        </Box>
      )}

      {tentativaStarted && assessmentData && (
        <QuizContent
          assessmentData={assessmentData}
          currentQuestionIndex={currentQuestionIndex}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          respostas={respostas}
          handleAnswerChange={handleAnswerChange}
          timeRemaining={timeRemaining}
          formatTime={formatTime}
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit}
        />
      )}
    </Box>
  )
}

function QuizContent({
  assessmentData,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  respostas,
  handleAnswerChange,
  timeRemaining,
  formatTime,
  isSubmitting,
  handleSubmit,
}: {
  assessmentData: StartAssessmentResponse
  currentQuestionIndex: number
  setCurrentQuestionIndex: (fn: (prev: number) => number) => void
  respostas: Record<string, string>
  handleAnswerChange: (questaoId: string, resposta: string) => void
  timeRemaining: number | null
  formatTime: (seconds: number) => string
  isSubmitting: boolean
  handleSubmit: () => void
}) {
  const currentQuestion = assessmentData.questoes[currentQuestionIndex]
  const totalQuestions = assessmentData.questoes.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  return (
    <Stack spacing={3}>
      {/* Header com timer e progresso */}
      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
          >
            <Typography variant='h6' fontWeight={600}>
              Questão {currentQuestionIndex + 1} de {totalQuestions}
            </Typography>
            {timeRemaining !== null && (
              <Chip
                icon={<Timer />}
                label={formatTime(timeRemaining)}
                color={timeRemaining < 300 ? 'error' : 'primary'}
                variant={timeRemaining < 300 ? 'filled' : 'outlined'}
              />
            )}
          </Stack>
          <LinearProgress variant='determinate' value={progress} />
        </Stack>
      </Paper>

      {/* Questão atual */}
      <Paper variant='outlined' sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant='h6' fontWeight={600} gutterBottom>
              {currentQuestion.enunciado}
            </Typography>
            <Chip
              label={`Peso: ${currentQuestion.peso}`}
              size='small'
              color='secondary'
              variant='outlined'
            />
          </Box>

          {/* Opções de resposta */}
          {(currentQuestion.tipo === 'MULTIPLA_ESCOLHA' ||
            currentQuestion.tipo === 'VERDADEIRO_FALSO') && (
            <FormControl>
              <RadioGroup
                value={respostas[currentQuestion.id] || ''}
                onChange={e =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
              >
                {currentQuestion.opcoes_resposta.map((opcao, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={opcao}
                    control={<Radio />}
                    label={
                      <Typography variant='body1'>
                        <strong>{String.fromCharCode(65 + idx)}.</strong>{' '}
                        {opcao}
                      </Typography>
                    }
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      px: 2,
                      py: 1.5,
                      mb: 1,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {/* Questão dissertativa */}
          {currentQuestion.tipo === 'DISSERTATIVA' && (
            <TextField
              multiline
              rows={8}
              fullWidth
              placeholder='Digite sua resposta aqui...'
              value={respostas[currentQuestion.id] || ''}
              onChange={e =>
                handleAnswerChange(currentQuestion.id, e.target.value)
              }
              variant='outlined'
            />
          )}
        </Stack>
      </Paper>

      {/* Navegação */}
      <Stack
        direction='row'
        spacing={2}
        justifyContent='space-between'
        alignItems='center'
      >
        <Button
          startIcon={<NavigateBefore />}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0}
          variant='outlined'
        >
          Anterior
        </Button>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button
            variant='contained'
            color='success'
            onClick={handleSubmit}
            disabled={isSubmitting}
            size='large'
            sx={{ minWidth: 200 }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              'Finalizar Avaliação'
            )}
          </Button>
        ) : (
          <Button
            endIcon={<NavigateNext />}
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            variant='contained'
          >
            Próxima
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
