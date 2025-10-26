import { useState, useEffect } from 'react'
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
  Divider,
} from '@mui/material'
import {
  CheckCircleRounded,
  TimerRounded,
  PlayArrowRounded,
} from '@mui/icons-material'
import {
  useStartAssessment,
  useSubmitAssessment,
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
  onComplete,
}: AssessmentQuizProps) {
  const startAssessment = useStartAssessment()
  const submitAssessment = useSubmitAssessment()

  const [assessmentData, setAssessmentData] =
    useState<StartAssessmentResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tentativaStarted, setTentativaStarted] = useState(false)

  // Handler para iniciar a tentativa
  const handleStartTentativa = async () => {
    try {
      const result = await startAssessment.mutateAsync(avaliacao.codigo)
      console.log('📝 Tentativa iniciada:', result)
      setAssessmentData(result)
      setTentativaStarted(true)

      // Configurar timer se houver tempo limite
      if (result.avaliacao.tempo_limite) {
        setTimeRemaining(result.avaliacao.tempo_limite * 60) // converter para segundos
      }

      // Mostrar informações sobre tentativas
      if (result.tentativas_anteriores > 0) {
        toast.info(
          `Esta é sua tentativa nº ${result.tentativas_anteriores + 1}${
            result.avaliacao.tentativas_permitidas
              ? ` de ${result.avaliacao.tentativas_permitidas}`
              : ''
          }`
        )
      }
    } catch (error: unknown) {
      console.error('❌ Erro ao iniciar tentativa:', error)
      const err = error as {
        message?: string
        response?: { data?: { message?: string } }
      }
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Erro ao iniciar tentativa'
      toast.error(errorMessage)
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

  const handleSubmit = async () => {
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

      toast.success(result.mensagem)

      if (onComplete) {
        onComplete()
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      toast.error(err.message || 'Erro ao enviar avaliação')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Se tentativa não foi iniciada, mostrar informações da avaliação
  if (!tentativaStarted) {
    return (
      <Box sx={{ py: 2 }}>
        <Paper variant='outlined' sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant='h6' fontWeight={600} gutterBottom>
                {avaliacao.titulo}
              </Typography>
              <Divider sx={{ my: 2 }} />
            </Box>

            {/* Informações da avaliação */}
            <Stack spacing={2}>
              <Box>
                <Typography variant='subtitle2' color='text.secondary'>
                  Informações da Avaliação
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {avaliacao.tempo_limite && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <TimerRounded fontSize='small' color='action' />
                      <Typography variant='body2'>
                        <strong>Tempo limite:</strong> {avaliacao.tempo_limite}{' '}
                        minutos
                      </Typography>
                    </Box>
                  )}
                  {avaliacao.tentativas_permitidas && (
                    <Typography variant='body2'>
                      <strong>Tentativas permitidas:</strong>{' '}
                      {avaliacao.tentativas_permitidas}
                    </Typography>
                  )}
                  {avaliacao.nota_minima != null && (
                    <Typography variant='body2'>
                      <strong>Nota mínima para aprovação:</strong>{' '}
                      {avaliacao.nota_minima}%
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Alert severity='info' sx={{ fontSize: '0.875rem' }}>
                Ao clicar em "Iniciar Avaliação", sua tentativa será registrada
                e o tempo começará a contar (se houver limite).
              </Alert>
            </Stack>

            {/* Botão para iniciar */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
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
          </Stack>
        </Paper>
      </Box>
    )
  }

  // Se não tem dados da tentativa ainda, mostrar loading
  if (!assessmentData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  // Quiz ativo - tentativa iniciada
  const currentQuestion = assessmentData.questoes[currentQuestionIndex]
  const progress =
    ((currentQuestionIndex + 1) / assessmentData.questoes.length) * 100

  return (
    <Box sx={{ py: 2 }}>
      {/* Header com informações */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Typography variant='h6' fontWeight={600}>
          {avaliacao.titulo}
        </Typography>

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

          {assessmentData.avaliacao.nota_minima && (
            <Chip
              label={`Nota mínima: ${assessmentData.avaliacao.nota_minima}%`}
              size='small'
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
      <Paper variant='outlined' sx={{ p: 3, mb: 3 }}>
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
    </Box>
  )
}
