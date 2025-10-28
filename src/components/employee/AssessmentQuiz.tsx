import { useState, useEffect, useCallback } from 'react'
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
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import {
  CheckCircleRounded,
  TimerRounded,
  PlayArrowRounded,
} from '@mui/icons-material'
import {
  useStartAssessment,
  useSubmitAssessment,
  useActiveAttempt,
  useUserAttempts,
  type StartAssessmentResponse,
  type AssessmentForStudent,
} from '@/api/assessments'
import { toast } from 'react-toastify'

interface AssessmentQuizProps {
  avaliacao: AssessmentForStudent
  onComplete?: () => void
}

export default function AssessmentQuiz({
  avaliacao,
  onComplete: _onComplete,
}: AssessmentQuizProps) {
  const startAssessment = useStartAssessment()
  const submitAssessment = useSubmitAssessment()

  // Buscar tentativa ativa ao montar o componente
  const { data: activeAttempt } = useActiveAttempt(avaliacao.codigo, true)

  // Buscar histórico de tentativas
  const { data: userAttempts = [] } = useUserAttempts(avaliacao.codigo, true)

  const [assessmentData, setAssessmentData] =
    useState<StartAssessmentResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tentativaStarted, setTentativaStarted] = useState(false)
  const [currentTab, setCurrentTab] = useState<'info' | 'questoes'>('info')

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
      attempt =>
        attempt.status === 'APROVADO' ||
        (attempt.nota_obtida !== null && attempt.nota_obtida >= 70)
    )
    if (hasApproved) return false

    // Verificar se há tentativa pendente de revisão
    const hasPendingReview = userAttempts.some(
      attempt => attempt.status === 'PENDENTE_REVISAO'
    )
    if (hasPendingReview) return false

    // Verificar se ainda tem tentativas disponíveis
    const tentativasUsadas = userAttempts.filter(
      a => a.status !== 'EM_ANDAMENTO'
    ).length
    return tentativasUsadas < (avaliacao.tentativas_permitidas || 2)
  }

  // Obter a última tentativa finalizada
  const lastFinishedAttempt = userAttempts
    .filter(a => a.status !== 'EM_ANDAMENTO')
    .sort(
      (a, b) =>
        new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
    )[0]

  // Mapear status para exibição
  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      APROVADO: { label: '✅ Aprovado', color: 'success.main' },
      REPROVADO: { label: '❌ Reprovado', color: 'error.main' },
      PENDENTE_REVISAO: {
        label: '⏳ Pendente de Revisão',
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
      const result = await submitAssessment.mutateAsync({
        tentativa_id: assessmentData.tentativa.id,
        respostas: Object.entries(respostas).map(([questao_id, resposta]) => ({
          questao_id,
          resposta_funcionario: resposta,
        })),
      })

      // Mostrar resultado
      if (result.status === 'APROVADO') {
        toast.success(
          `✅ ${result.mensagem}\n\nNota: ${result.nota_obtida?.toFixed(1)}% (Mínima: ${result.nota_minima}%)`
        )
      } else if (result.status === 'REPROVADO') {
        toast.error(
          `❌ ${result.mensagem}\n\nNota: ${result.nota_obtida?.toFixed(1)}% (Mínima: ${result.nota_minima}%)`
        )
      } else if (result.status === 'PENDENTE_REVISAO') {
        toast.info(
          `⏳ ${result.mensagem}\n\nSua avaliação está aguardando correção das questões dissertativas.`
        )
      } else {
        toast.success(result.mensagem)
      }

      // Resetar estado do quiz para voltar à tela de informações
      setTentativaStarted(false)
      setAssessmentData(null)
      setRespostas({})
      setCurrentQuestionIndex(0)
      setTimeRemaining(null)
      setCurrentTab('info')

      // NÃO chamar onComplete() - deixar o aluno decidir se quer finalizar o módulo
      // O módulo só deve ser finalizado manualmente quando status = APROVADO
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
          toast.info(
            'Tentativa em andamento recuperada. Continue de onde parou!'
          )
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
      const result = await startAssessment.mutateAsync(avaliacao.codigo)
      console.log('📝 Tentativa iniciada:', result)
      setAssessmentData(result)
      setTentativaStarted(true)
      setCurrentTab('questoes') // Mudar para aba de questões

      // Configurar timer se houver tempo limite
      if (result.avaliacao.tempo_limite) {
        setTimeRemaining(result.avaliacao.tempo_limite * 60) // converter para segundos
      }

      // Mostrar informações sobre tentativas
      const tentativaNumero = result.tentativas_anteriores + 1
      const totalPermitido = 2 // Regra: 2 tentativas (inicial + recuperação)

      if (result.tentativas_anteriores > 0) {
        toast.warning(
          `⚠️ ATENÇÃO: Esta é sua ${tentativaNumero}ª tentativa (tentativa de recuperação). Você precisa obter nota mínima de 7.0 para aprovação.`,
          { autoClose: 8000 }
        )
      } else {
        toast.info(
          `📝 Avaliação iniciada! Você tem ${totalPermitido} tentativas no total. Nota mínima para aprovação: 7.0`,
          { autoClose: 5000 }
        )
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
    if (timeRemaining === null || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          handleSubmit() // Auto-submit quando tempo acabar
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
      <Stack spacing={2}>
        {/* Tabs */}
        <Box
          sx={{
            mb: 2,
            borderBottom: theme => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, val) => setCurrentTab(val)}
            scrollButtons='auto'
          >
            <Tab value='info' label='Informações' />
            <Tab
              value='questoes'
              label='Questões'
              disabled={!tentativaStarted}
            />
          </Tabs>
        </Box>

        {/* Aba de Informações */}
        {currentTab === 'info' && (
          <Box>
            <Stack gap={2}>
              {/* Alerta de pré-requisitos */}
              <Typography variant='body2'>
                • Todos os módulos obrigatórios devem estar concluídos antes de
                iniciar esta avaliação.
                <br />• Tempo limite: {avaliacao.tempo_limite} minutos
                <br />• Nota mínima: {avaliacao.nota_minima}
                <br />• Tentativas permitidas: {avaliacao.tentativas_permitidas}
                <br />• Novas tentativas são permitidas se você não atingir a
                nota mínima para aprovação.
              </Typography>

              {/* Histórico de Tentativas */}
              {userAttempts.length > 0 && (
                <Box>
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
                                <Typography
                                  variant='subtitle2'
                                  fontWeight={600}
                                >
                                  Tentativa {userAttempts.length - index}
                                </Typography>
                                <Chip
                                  label={statusInfo.label}
                                  size='small'
                                  sx={{
                                    bgcolor: statusInfo.color,
                                    color: 'white',
                                    fontWeight: 600,
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
                                    <Typography
                                      variant='body2'
                                      fontWeight={600}
                                    >
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
                                      minute: '2-digit',
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

              {/* Status da última tentativa */}
              {lastFinishedAttempt && (
                <Alert
                  severity={
                    lastFinishedAttempt.status === 'APROVADO'
                      ? 'success'
                      : lastFinishedAttempt.status === 'PENDENTE_REVISAO'
                        ? 'info'
                        : 'warning'
                  }
                >
                  <Typography variant='body2' fontWeight={600}>
                    {lastFinishedAttempt.status === 'APROVADO' &&
                      '✅ Você foi aprovado nesta avaliação!'}
                    {lastFinishedAttempt.status === 'REPROVADO' &&
                      '❌ Você não atingiu a nota mínima. Tente novamente!'}
                    {lastFinishedAttempt.status === 'PENDENTE_REVISAO' &&
                      '⏳ Sua avaliação está aguardando correção.'}
                  </Typography>
                  {lastFinishedAttempt.nota_obtida !== null && (
                    <Typography variant='body2' sx={{ mt: 0.5 }}>
                      Nota obtida: {lastFinishedAttempt.nota_obtida}
                      {lastFinishedAttempt.status === 'REPROVADO' &&
                        ` (Nota mínima: ${avaliacao.nota_minima})`}
                    </Typography>
                  )}
                </Alert>
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
            </Stack>
          </Box>
        )}

        {/* Aba de Questões */}
        {currentTab === 'questoes' && tentativaStarted && assessmentData && (
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

        {assessmentData.tentativas_anteriores > 0 && (
          <Alert severity='info' sx={{ fontSize: '0.875rem' }}>
            Esta é sua tentativa nº {assessmentData.tentativas_anteriores + 1}
            {assessmentData.avaliacao.tentativas_permitidas &&
              ` de ${assessmentData.avaliacao.tentativas_permitidas}`}
          </Alert>
        )}
      </Stack>

      {/* Questão atual */}
      <Paper variant='outlined' sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Chip
              label={
                currentQuestion.tipo === 'MULTIPLA_ESCOLHA'
                  ? 'Múltipla Escolha'
                  : currentQuestion.tipo === 'VERDADEIRO_FALSO'
                    ? 'Verdadeiro ou Falso'
                    : 'Dissertativa'
              }
              size='small'
              color='primary'
              sx={{ mb: 2 }}
            />
            <Typography variant='body1' fontWeight={500}>
              {currentQuestion.enunciado}
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
              Peso: {currentQuestion.peso} ponto(s)
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
