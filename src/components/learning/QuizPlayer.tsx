import { useState, useEffect, useCallback, useMemo } from 'react'
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
  Alert,
  Stack,
  Chip,
  Divider,
  CircularProgress,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  TextField,
} from '@mui/material'
import {
  Timer,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  PlayArrow,
  PlayArrowRounded,
  TimerRounded,
} from '@mui/icons-material'
import {
  useStartAssessment,
  useSubmitAssessment,
  useActiveAttempt,
  useUserAttempts,
  type StartAssessmentResponse,
  useAttemptForReview,
} from '@/api/assessments'
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
  onComplete: (aprovado: boolean) => void
}

export default function QuizPlayer({
  avaliacaoId,
  avaliacaoInfo,
  onComplete,
}: QuizPlayerProps) {
  const startAssessment = useStartAssessment()
  const submitAssessment = useSubmitAssessment()

  // Buscar tentativa ativa ao montar o componente
  const { data: activeAttempt } = useActiveAttempt(avaliacaoId, true)

  // Buscar histórico de tentativas
  const { data: userAttempts = [] } = useUserAttempts(avaliacaoId, true)

  const latestApprovedAttempt = useMemo(() => {
    return (
      userAttempts
        .filter(attempt => attempt.status === 'APROVADO')
        .sort(
          (a, b) =>
            new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
        )[0] || null
    )
  }, [userAttempts])

  const reviewAttemptId = latestApprovedAttempt?.id ?? ''

  const { data: reviewData } = useAttemptForReview(
    reviewAttemptId,
    !!reviewAttemptId
  )

  const [assessmentData, setAssessmentData] =
    useState<StartAssessmentResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tentativaStarted, setTentativaStarted] = useState(false)

  // Calcular tempo gasto em minutos
  const calculateTimeSpent = (dataInicio: string, dataFim: string | null) => {
    if (!dataFim) return 'Em andamento'
    const inicio = new Date(dataInicio).getTime()
    const fim = new Date(dataFim).getTime()
    const minutos = Math.floor((fim - inicio) / 60000)
    return `${minutos} min`
  }

  // Verificar se deve mostrar o botão de iniciar
  const shouldShowStartButton = () => {
    // Se não há tentativas, pode iniciar
    if (userAttempts.length === 0) return true

    // Verificar se já foi aprovado
    const hasApproved = userAttempts.some(
      attempt => attempt.status === 'APROVADO'
    )
    if (hasApproved) return false

    // Verificar se há tentativa pendente de revisão
    const hasPendingReview = userAttempts.some(
      attempt => attempt.status === 'AGUARDANDO_CORRECAO'
    )
    if (hasPendingReview) return false

    // Verificar se ainda tem tentativas disponíveis
    const tentativasUsadas = userAttempts.filter(
      a => a.status !== 'EM_ANDAMENTO'
    ).length
    return tentativasUsadas < (avaliacaoInfo?.tentativas_permitidas || 0)
  }

  // Mapear status para exibição
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      APROVADO: { label: '✅ Aprovado', color: 'success.main' },
      REPROVADO: { label: '❌ Reprovado', color: 'error.main' },
      AGUARDANDO_CORRECAO: {
        label: '⏳ Aguardando correção',
        color: 'warning.main',
      },
      EM_ANDAMENTO: { label: '🔄 Em Andamento', color: 'info.main' },
    }
    return statusMap[status] || { label: status, color: 'text.secondary' }
  }

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
      await submitAssessment.mutateAsync({
        tentativa_id: assessmentData.tentativa.id,
        respostas: Object.entries(respostas).map(([questao_id, resposta]) => ({
          questao_id,
          resposta_funcionario: resposta,
        })),
      })

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
  }, [assessmentData, respostas, submitAssessment])

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
        {avaliacaoInfo?.titulo || 'Informações da Avaliação'}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={2}>
        <Box>
          <Typography variant='body1' color='text.secondary'>
            <strong>⏱️ Tempo limite:</strong>{' '}
            {avaliacaoInfo?.tempo_limite || 'N/A'} minutos
          </Typography>
        </Box>

        <Box>
          <Typography variant='body1' color='text.secondary'>
            <strong>📊 Nota mínima para aprovação:</strong>{' '}
            {avaliacaoInfo?.nota_minima || 'N/A'}
          </Typography>
        </Box>

        <Box>
          <Typography variant='body1' color='text.secondary'>
            <strong>🔄 Tentativas permitidas:</strong>{' '}
            {avaliacaoInfo?.tentativas_permitidas || 'Ilimitadas'}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Alert severity='info'>
          <Typography variant='body2'>
            Certifique-se de revisar todo o conteúdo antes de iniciar a
            avaliação. O tempo começará a contar assim que você clicar em
            "Iniciar Avaliação".
          </Typography>
        </Alert>
      </Stack>

      {userAttempts.length > 0 && (
        <Box sx={{ pt: 3 }}>
          <Typography variant='h6' gutterBottom>
            Histórico de Tentativas
          </Typography>
          <Stack gap={1.5}>
            {userAttempts
              .filter(a => a.status !== 'EM_ANDAMENTO')
              .sort(
                (a, b) =>
                  new Date(b.criado_em).getTime() -
                  new Date(a.criado_em).getTime()
              )
              .map((attempt, index) => {
                const statusInfo = getStatusDisplay(attempt.status)
                return (
                  <Paper
                    key={attempt.id}
                    elevation={2}
                    sx={{
                      p: 2,
                      borderLeft: theme =>
                        `4px solid ${theme.palette[statusInfo.color.split('.')[0] as 'success' | 'error' | 'warning' | 'info'].main}`,
                    }}
                  >
                    <Stack gap={1}>
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        alignItems='center'
                      >
                        <Typography variant='subtitle2' fontWeight={600}>
                          Tentativa {userAttempts.length - index}
                        </Typography>
                        <Chip
                          label={statusInfo.label}
                          size='small'
                          sx={{
                            bgcolor: statusInfo.color,
                            color: 'white',
                          }}
                        />
                      </Box>

                      <Box
                        display='flex'
                        gap={3}
                        flexWrap='wrap'
                        sx={{ fontSize: '0.875rem' }}
                      >
                        {attempt.nota_obtida !== null && (
                          <Box>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              Nota Obtida
                            </Typography>
                            <Typography
                              variant='body2'
                              fontWeight={600}
                              color={
                                attempt.nota_obtida >= 70
                                  ? 'success.main'
                                  : 'error.main'
                              }
                            >
                              {attempt.nota_obtida}
                            </Typography>
                          </Box>
                        )}

                        {attempt.data_fim && (
                          <Box>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                            >
                              Tempo Gasto
                            </Typography>
                            <Typography variant='body2' fontWeight={600}>
                              {calculateTimeSpent(
                                attempt.data_inicio,
                                attempt.data_fim
                              )}
                            </Typography>
                          </Box>
                        )}

                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            Iniciada em:
                          </Typography>
                          <Typography variant='body2' fontWeight={600}>
                            {new Date(attempt.criado_em).toLocaleDateString(
                              'pt-BR',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Paper>
                )
              })}
          </Stack>
        </Box>
      )}

      {/* Botão para iniciar */}
      {!tentativaStarted && shouldShowStartButton() && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
          <Button
            variant='contained'
            size='large'
            startIcon={
              startAssessment.isPending ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <PlayArrowRounded />
              )
            }
            disabled={startAssessment.isPending}
            onClick={handleStartTentativa}
            sx={{ minWidth: 200 }}
          >
            {startAssessment.isPending ? 'Iniciando...' : 'Iniciar Avaliação'}
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
  const progress =
    ((currentQuestionIndex + 1) / assessmentData.questoes.length) * 100

  return (
    <Box>
      {/* Header com informações */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Box>
            <Typography variant='h6'>
              {assessmentData.avaliacao.titulo}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Questão {currentQuestionIndex + 1} de{' '}
              {assessmentData.questoes.length}
            </Typography>
          </Box>

          <Stack direction='row' spacing={2} alignItems='center'>
            {timeRemaining !== null && (
              <Chip
                icon={<Timer />}
                label={formatTime(timeRemaining)}
                color={timeRemaining < 300 ? 'error' : 'default'}
                variant={timeRemaining < 300 ? 'filled' : 'outlined'}
              />
            )}
          </Stack>
        </Stack>

        <LinearProgress
          variant='determinate'
          value={
            ((currentQuestionIndex + 1) / assessmentData.questoes.length) * 100
          }
          sx={{ mt: 2 }}
        />
      </Paper>

      {/* Questão atual */}
      <Grid size={9}>
        <Paper
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 500,
            p: 4,
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Typography variant='body1' fontWeight={500}>
                {currentQuestion.enunciado}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 1 }}
              >
                Peso: {currentQuestion.peso}
              </Typography>
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
                        <Typography variant='body2'>
                          <strong>{String.fromCharCode(65 + idx)}.</strong>{' '}
                          {opcao}
                        </Typography>
                      }
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        px: 2,
                        py: 1,
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
                rows={6}
                fullWidth
                placeholder='Digite sua resposta aqui...'
                value={respostas[currentQuestion.id] || ''}
                onChange={e =>
                  handleAnswerChange(currentQuestion.id, e.target.value)
                }
              />
            )}
          </Stack>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 3,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              startIcon={<NavigateBefore />}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              disabled={currentQuestionIndex === 0}
            >
              Anterior
            </Button>

            <Button
              endIcon={<NavigateNext />}
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              variant='contained'
              disabled={
                currentQuestionIndex === assessmentData.questoes.length - 1
              }
            >
              Próxima
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Box>
  )
}
