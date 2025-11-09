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
} from '@mui/material'
import {
  Timer,
  CheckCircle,
  NavigateNext,
  NavigateBefore,
  PlayArrow,
} from '@mui/icons-material'
import {
  useStartAssessment,
  useSubmitAssessment,
  useActiveAttempt,
  useUserAttempts,
  type StartAssessmentResponse,
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
  funcionarioId: string
  avaliacaoInfo?: AvaliacaoInfo
  onComplete: (aprovado: boolean, nota: number) => void
  onCancel?: () => void
}

export default function QuizPlayer({
  avaliacaoId,
  funcionarioId,
  avaliacaoInfo,
  onComplete,
  onCancel,
}: QuizPlayerProps) {
  const startAssessment = useStartAssessment()
  const submitAssessment = useSubmitAssessment()

  // Buscar tentativa ativa ao montar o componente
  const { data: activeAttempt } = useActiveAttempt(avaliacaoId, true)

  // Buscar histórico de tentativas
  const { data: userAttempts = [], isLoading: loadingAttempts } =
    useUserAttempts(avaliacaoId, true)

  const [assessmentData, setAssessmentData] =
    useState<StartAssessmentResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tentativaStarted, setTentativaStarted] = useState(false)

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
  }, [assessmentData, respostas, submitAssessment, onComplete])

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

  const questoesRespondidas = Object.keys(respostas).length
  const todasRespondidas =
    assessmentData && questoesRespondidas === assessmentData.questoes.length
  const progressoQuestoes = assessmentData
    ? ((currentQuestionIndex + 1) / assessmentData.questoes.length) * 100
    : 0

  // Tela de informações (antes de iniciar)
  if (!tentativaStarted) {
    return (
      <Box>
        <Paper sx={{ p: 4 }}>
          <Typography variant='h5' gutterBottom fontWeight={600}>
            {avaliacaoInfo?.titulo || 'Informações da Avaliação'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={3}>
            {loadingAttempts ? (
              <Box textAlign='center' py={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
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
                      Certifique-se de revisar todo o conteúdo antes de iniciar
                      a avaliação. O tempo começará a contar assim que você
                      clicar em "Iniciar Avaliação".
                    </Typography>
                  </Alert>
                </Stack>

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
                                    }}
                                  />
                                </Box>

                                {attempt.nota_obtida !== null && (
                                  <Typography variant='body2'>
                                    Nota: <strong>{attempt.nota_obtida}</strong>
                                  </Typography>
                                )}
                              </Stack>
                            </Paper>
                          )
                        })}
                    </Stack>
                  </Box>
                )}

                {/* Botão para iniciar */}
                {!tentativaStarted && shouldShowStartButton() && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 2,
                      pt: 2,
                    }}
                  >
                    <Button
                      variant='contained'
                      size='large'
                      startIcon={
                        startAssessment.isPending ? (
                          <CircularProgress size={20} color='inherit' />
                        ) : (
                          <PlayArrow />
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
              </>
            )}
          </Stack>
        </Paper>
      </Box>
    )
  }

  // Loading state
  if (!assessmentData || assessmentData.questoes.length === 0) {
    return (
      <Box textAlign='center' py={8}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Carregando questões...</Typography>
      </Box>
    )
  }

  const currentQuestion = assessmentData.questoes[currentQuestionIndex]

  // Tela do quiz (após iniciar) - Layout com sidebar
  return (
    <Box>
      {/* Header com Timer e Progresso */}
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
            <Chip
              label={`${questoesRespondidas}/${assessmentData.questoes.length} respondidas`}
              color={todasRespondidas ? 'success' : 'default'}
            />
          </Stack>
        </Stack>

        <LinearProgress
          variant='determinate'
          value={progressoQuestoes}
          sx={{ mt: 2 }}
        />
      </Paper>

      {/* Layout: Sidebar de Questões + Conteúdo */}
      <Grid container spacing={2} alignItems='stretch'>
        {/* Sidebar - Lista de Questões */}
        <Grid size={3}>
          <Paper
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 500,
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant='subtitle2' fontWeight={600}>
                Questões
              </Typography>
            </Box>

            <List
              sx={{
                flex: 1,
                overflow: 'auto',
                py: 0,
              }}
            >
              {assessmentData.questoes.map((questao, index) => {
                const isAtual = index === currentQuestionIndex
                const isRespondida = !!respostas[questao.id]

                return (
                  <ListItemButton
                    key={questao.id}
                    selected={isAtual}
                    onClick={() => setCurrentQuestionIndex(index)}
                    sx={{
                      borderLeft: isAtual ? 4 : 0,
                      borderColor: 'primary.main',
                      backgroundColor: isRespondida
                        ? 'success.lighter'
                        : 'inherit',
                      '&.Mui-selected': {
                        backgroundColor: isRespondida
                          ? 'success.light'
                          : 'action.selected',
                      },
                      '&:hover': {
                        backgroundColor: isRespondida
                          ? 'success.light'
                          : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon>
                      {isRespondida ? (
                        <CheckCircle color='success' />
                      ) : (
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            border: 2,
                            borderColor: isAtual ? 'primary.main' : 'divider',
                          }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={`Questão ${index + 1}`}
                      primaryTypographyProps={{
                        fontWeight: isAtual ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                )
              })}
            </List>

            {/* Botão Finalizar na sidebar */}
            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Button
                fullWidth
                variant='contained'
                color='success'
                startIcon={
                  isSubmitting ? (
                    <CircularProgress size={20} color='inherit' />
                  ) : (
                    <CheckCircle />
                  )
                }
                onClick={handleSubmit}
                disabled={!todasRespondidas || isSubmitting}
              >
                {isSubmitting ? 'Finalizando...' : 'Finalizar Avaliação'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Conteúdo - Questão Atual */}
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
            <Typography variant='h6' gutterBottom>
              Questão {currentQuestionIndex + 1}
            </Typography>

            <Typography variant='body1' paragraph>
              {currentQuestion.enunciado}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <FormControl component='fieldset' fullWidth sx={{ flex: 1 }}>
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
                      mb: 1,
                      px: 2,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>

            {!respostas[currentQuestion.id] && (
              <Alert severity='info' sx={{ mt: 3 }}>
                Selecione uma alternativa para esta questão
              </Alert>
            )}

            {/* Navegação inferior */}
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
      </Grid>
    </Box>
  )
}
