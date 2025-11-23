import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Box,
  Typography,
  Stack,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Paper,
  LinearProgress,
  Chip,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material'
import {
  CheckCircleRounded,
  TimerRounded,
  PlayArrowRounded
} from '@mui/icons-material'
import {
  useStartAssessment,
  useSubmitAssessment,
  useActiveAttempt,
  useUserAttempts,
  useAttemptForReview,
  type StartAssessmentResponse,
  type AssessmentForStudent
} from '@/api/assessments'
import { toast } from 'react-toastify'
import AssessmentReviewSummary from './AssessmentReviewSummary'

interface AssessmentQuizProps {
  avaliacao: AssessmentForStudent
  onComplete?: () => void
}

export default function AssessmentQuiz({ avaliacao }: AssessmentQuizProps) {
  const startAssessment = useStartAssessment()
  const submitAssessment = useSubmitAssessment()

  // Buscar tentativa ativa ao montar o componente
  const { data: activeAttempt } = useActiveAttempt(avaliacao.codigo, true)

  // Buscar histórico de tentativas
  const { data: userAttempts = [] } = useUserAttempts(avaliacao.codigo, true)

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

  const showReviewTab = Boolean(latestApprovedAttempt)
  const reviewAttemptId = latestApprovedAttempt?.id ?? ''

  const { data: reviewData, isLoading: reviewLoading } = useAttemptForReview(
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
  const [currentTab, setCurrentTab] = useState<'info' | 'questoes' | 'revisao'>(
    'info'
  )
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)

  // Refs para manter valores atualizados no auto-submit
  const assessmentDataRef = useRef<StartAssessmentResponse | null>(null)
  const respostasRef = useRef<Record<string, string>>({})

  // Sincronizar refs com states
  useEffect(() => {
    assessmentDataRef.current = assessmentData
  }, [assessmentData])

  useEffect(() => {
    respostasRef.current = respostas
  }, [respostas])

  // Função para auto-submit (quando tempo esgota)
  const performAutoSubmit = useCallback(async () => {
    const currentAssessmentData = assessmentDataRef.current
    const currentRespostas = respostasRef.current

    if (!currentAssessmentData) {
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar respostas: enviar as que foram respondidas, e null para as não respondidas
      const todasQuestoes = currentAssessmentData.questoes
      const respostasParaEnviar = todasQuestoes.map(questao => ({
        questao_id: questao.id,
        resposta_funcionario: currentRespostas[questao.id] || null
      }))

      await submitAssessment.mutateAsync({
        tentativa_id: currentAssessmentData.tentativa.id,
        respostas: respostasParaEnviar
      })

      // Resetar estado do quiz
      setTentativaStarted(false)
      setAssessmentData(null)
      setRespostas({})
      setCurrentQuestionIndex(0)
      setTimeRemaining(null)
      setCurrentTab('info')
      setHasAutoSubmitted(false)
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || 'Erro ao enviar avaliação automaticamente')
    } finally {
      setIsSubmitting(false)
    }
  }, [submitAssessment])

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
    if (showReviewTab) return false

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
    return tentativasUsadas < (avaliacao.tentativas_permitidas || 0)
  }

  // Mapear status para exibição
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      APROVADO: { label: '✅ Aprovado', color: 'success.main' },
      REPROVADO: { label: '❌ Reprovado', color: 'error.main' },
      AGUARDANDO_CORRECAO: {
        label: '⏳ Aguardando correção ',
        color: 'warning.main'
      },
      EM_ANDAMENTO: { label: '🔄 Em Andamento', color: 'info.main' }
    }
    return statusMap[status] || { label: status, color: 'text.secondary' }
  }

  const handleSubmit = useCallback(async () => {
    if (!assessmentData) {
      return
    }

    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar respostas: enviar as que foram respondidas, e null para as não respondidas
      const todasQuestoes = assessmentData.questoes
      const respostasParaEnviar = todasQuestoes.map(questao => ({
        questao_id: questao.id,
        resposta_funcionario: respostas[questao.id] || null
      }))

      await submitAssessment.mutateAsync({
        tentativa_id: assessmentData.tentativa.id,
        respostas: respostasParaEnviar
      })

      // Resetar estado do quiz para voltar à tela de informações
      setTentativaStarted(false)
      setAssessmentData(null)
      setRespostas({})
      setCurrentQuestionIndex(0)
      setTimeRemaining(null)
      setCurrentTab('info')
      setHasAutoSubmitted(false)

      // ✅ Módulo é concluído automaticamente pelo backend quando aprovado
      // Não é mais necessário chamar onComplete() aqui
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || 'Erro ao enviar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }, [assessmentData, respostas, submitAssessment, isSubmitting])

  // Recuperar tentativa ativa se existir
  useEffect(() => {
    if (activeAttempt && !assessmentData) {
      setAssessmentData(activeAttempt)
      setTentativaStarted(true)
      setCurrentTab('questoes') // Mudar para aba de questões automaticamente

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
        } else if (!hasAutoSubmitted) {
          // Tempo esgotado, submeter automaticamente
          setHasAutoSubmitted(true)
          toast.warning(
            'Tempo esgotado! Submetendo respostas automaticamente...',
            { autoClose: 3000 }
          )

          setTimeout(() => {
            performAutoSubmit()
          }, 1000)
        }
      }
    }
  }, [activeAttempt, assessmentData, hasAutoSubmitted, performAutoSubmit])

  // Handler para iniciar a tentativa
  const handleStartTentativa = async () => {
    try {
      const result = await startAssessment.mutateAsync(avaliacao.codigo)
      setAssessmentData(result)
      setTentativaStarted(true)
      setCurrentTab('questoes') // Mudar para aba de questões

      // Configurar timer se houver tempo limite
      if (result.avaliacao.tempo_limite) {
        setTimeRemaining(result.avaliacao.tempo_limite * 60) // converter para segundos
      }
    } catch (error: unknown) {
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

      // Tratamento específico para erros de validação
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
    if (timeRemaining === null || timeRemaining <= 0 || hasAutoSubmitted) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)

          // Auto-submit quando tempo acabar
          if (!hasAutoSubmitted && !isSubmitting) {
            setHasAutoSubmitted(true)
            toast.warning(
              'Tempo esgotado! Submetendo respostas automaticamente...',
              { autoClose: 3000 }
            )

            setTimeout(() => {
              performAutoSubmit()
            }, 500)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, hasAutoSubmitted, isSubmitting, performAutoSubmit])

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
      <Stack spacing={2}>
        {/* Tabs */}
        <Box
          sx={{
            mb: 2,
            borderBottom: theme => `1px solid ${theme.palette.divider}`
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            scrollButtons='auto'
          >
            <Tab value='info' label='Informações' />
            {!showReviewTab && (
              <Tab
                value='questoes'
                label='Questões'
                disabled={!tentativaStarted}
              />
            )}
            {showReviewTab && (
              <Tab
                value='revisao'
                label='Revisão'
                disabled={reviewLoading && !reviewData}
              />
            )}
          </Tabs>
        </Box>

        {/* Aba de Informações */}
        {currentTab === 'info' && (
          <Box>
            {/* Alerta de pré-requisitos */}
            <Stack gap={1}>
              <Typography variant='body2' color='text.secondary'>
                Todos os módulos obrigatórios devem estar concluídos antes de
                iniciar esta avaliação.
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                <strong>Tempo limite:</strong> {avaliacao.tempo_limite} min
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                <strong>Nota mínima:</strong> {avaliacao.nota_minima}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                <strong>Tentativas permitidas:</strong>
                {avaliacao.tentativas_permitidas}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Novas tentativas são permitidas se você não atingir a nota
                mínima para aprovação.
              </Typography>
            </Stack>

            {/* Histórico de Tentativas */}
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
                              `4px solid ${theme.palette[statusInfo.color.split('.')[0] as 'success' | 'error' | 'warning' | 'info'].main}`
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
                                  color: 'white'
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
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  Iniciada em:
                                </Typography>
                                <Typography variant='body2' fontWeight={600}>
                                  {new Date(
                                    attempt.criado_em
                                  ).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
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
                  {startAssessment.isPending
                    ? 'Iniciando...'
                    : 'Iniciar Avaliação'}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Aba de Questões */}
        {!showReviewTab &&
          currentTab === 'questoes' &&
          tentativaStarted &&
          assessmentData && (
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

        {/* Aba de Revisão */}
        {showReviewTab &&
          currentTab === 'revisao' &&
          (reviewLoading && !reviewData ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : reviewData ? (
            <AssessmentReviewSummary review={reviewData} />
          ) : (
            <Paper variant='outlined' sx={{ p: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                Não foi possível carregar a revisão desta tentativa.
              </Typography>
            </Paper>
          ))}
      </Stack>
    </Box>
  )
}

// Componente separado para o conteúdo do quiz
function QuizContent({
  assessmentData,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  respostas,
  handleAnswerChange,
  timeRemaining,
  formatTime,
  isSubmitting,
  handleSubmit
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
    <Stack spacing={3}>
      {/* Header com informações */}
      <Stack spacing={2}>
        <Stack
          direction='row'
          spacing={2}
          alignItems='center'
          flexWrap='wrap'
          gap={1}
        >
          <Chip
            label={`Questão ${currentQuestionIndex + 1} de ${assessmentData.questoes.length}`}
            color='primary'
            variant='outlined'
          />

          {timeRemaining !== null && (
            <Chip
              icon={<TimerRounded />}
              label={formatTime(timeRemaining)}
              color={timeRemaining < 60 ? 'error' : 'default'}
              variant='filled'
            />
          )}
        </Stack>

        {/* Progress bar */}
        <Box>
          <LinearProgress variant='determinate' value={progress} />
        </Box>
      </Stack>

      {/* Questão atual */}
      <Paper variant='outlined' sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant='body1' fontWeight={500}>
              {currentQuestion.enunciado}
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
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
                        bgcolor: 'action.hover'
                      }
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
      </Paper>

      {/* Navegação */}
      <Stack
        direction='row'
        spacing={2}
        justifyContent='space-between'
        alignItems='center'
      >
        <Button
          variant='outlined'
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
        >
          Anterior
        </Button>

        <Typography variant='caption' color='text.secondary'>
          {Object.keys(respostas).length} de {assessmentData.questoes.length}{' '}
          respondidas
        </Typography>

        {currentQuestionIndex < assessmentData.questoes.length - 1 ? (
          <Button
            variant='contained'
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
          >
            Próxima
          </Button>
        ) : (
          <Button
            variant='contained'
            color='success'
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <CheckCircleRounded />
              )
            }
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Enviando...' : 'Finalizar Avaliação'}
          </Button>
        )}
      </Stack>
    </Stack>
  )
}
