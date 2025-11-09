import { useState, useEffect } from 'react'
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
} from '@mui/material'
import {
  Timer,
  CheckCircle,
  Cancel,
  NavigateNext,
  NavigateBefore,
} from '@mui/icons-material'
import {
  useIniciarTentativa,
  useResponderQuestao,
  useFinalizarTentativa,
  type Tentativa,
  type Questao,
} from '@/api/assessments'

interface QuizPlayerProps {
  avaliacaoId: string
  funcionarioId: string
  onComplete: (aprovado: boolean, nota: number) => void
  onCancel?: () => void
}

export default function QuizPlayer({
  avaliacaoId,
  funcionarioId,
  onComplete,
  onCancel,
}: QuizPlayerProps) {
  const [tentativa, setTentativa] = useState<Tentativa | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [tempoRestante, setTempoRestante] = useState<number | null>(null)
  const [finalizando, setFinalizando] = useState(false)

  const iniciarMutation = useIniciarTentativa()
  const responderMutation = useResponderQuestao()
  const finalizarMutation = useFinalizarTentativa()

  // Iniciar tentativa ao montar
  useEffect(() => {
    iniciarMutation.mutate(
      { avaliacaoId, funcionarioId },
      {
        onSuccess: data => {
          setTentativa(data.tentativa)
          setQuestoes(data.questoes)

          // Configurar timer se houver tempo limite
          if (data.tentativa.tempo_limite_minutos) {
            setTempoRestante(data.tentativa.tempo_limite_minutos * 60) // converter para segundos
          }
        },
        onError: error => {
          console.error('Erro ao iniciar tentativa:', error)
        },
      }
    )
  }, [avaliacaoId, funcionarioId])

  // Timer countdown
  useEffect(() => {
    if (tempoRestante === null || tempoRestante <= 0) return

    const interval = setInterval(() => {
      setTempoRestante(prev => {
        if (prev === null || prev <= 1) {
          // Tempo esgotado - finalizar automaticamente
          handleFinalizarTentativa()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [tempoRestante])

  const currentQuestion = questoes[currentQuestionIndex]

  const handleRespostaChange = (questaoId: string, alternativaId: string) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: alternativaId,
    }))

    // Salvar resposta no backend
    if (tentativa) {
      responderMutation.mutate({
        tentativaId: tentativa.id,
        questaoId,
        alternativaId,
      })
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questoes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleFinalizarTentativa = () => {
    if (!tentativa) return

    setFinalizando(true)

    finalizarMutation.mutate(
      { tentativaId: tentativa.id },
      {
        onSuccess: resultado => {
          const aprovado = resultado.status === 'APROVADO'
          onComplete(aprovado, resultado.nota_obtida)
        },
        onError: error => {
          console.error('Erro ao finalizar tentativa:', error)
          setFinalizando(false)
        },
      }
    )
  }

  const formatTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressoQuestoes =
    questoes.length > 0
      ? ((currentQuestionIndex + 1) / questoes.length) * 100
      : 0

  const questoesRespondidas = Object.keys(respostas).length
  const todasRespondidas = questoesRespondidas === questoes.length

  // Loading state
  if (iniciarMutation.isPending || !tentativa || questoes.length === 0) {
    return (
      <Box textAlign='center' py={8}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Carregando avaliação...</Typography>
      </Box>
    )
  }

  // Error state
  if (iniciarMutation.isError) {
    return (
      <Alert severity='error'>
        Erro ao carregar avaliação. Tente novamente.
        {onCancel && (
          <Button onClick={onCancel} sx={{ mt: 2 }}>
            Voltar
          </Button>
        )}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header com Timer e Progresso */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          mb={2}
        >
          <Box>
            <Typography variant='h6'>{tentativa.avaliacao_titulo}</Typography>
            <Typography variant='body2' color='text.secondary'>
              Questão {currentQuestionIndex + 1} de {questoes.length}
            </Typography>
          </Box>

          <Stack direction='row' spacing={2} alignItems='center'>
            {tempoRestante !== null && (
              <Chip
                icon={<Timer />}
                label={formatTempo(tempoRestante)}
                color={tempoRestante < 300 ? 'error' : 'default'}
                variant={tempoRestante < 300 ? 'filled' : 'outlined'}
              />
            )}
            <Chip
              label={`${questoesRespondidas}/${questoes.length} respondidas`}
              color={todasRespondidas ? 'success' : 'default'}
            />
          </Stack>
        </Stack>

        <LinearProgress variant='determinate' value={progressoQuestoes} />
      </Paper>

      {/* Questão Atual */}
      <Paper sx={{ p: 4, mb: 3, minHeight: 400 }}>
        <Typography variant='h6' gutterBottom>
          {currentQuestion.enunciado}
        </Typography>

        {currentQuestion.imagem_url && (
          <Box sx={{ my: 3, textAlign: 'center' }}>
            <img
              src={currentQuestion.imagem_url}
              alt='Imagem da questão'
              style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8 }}
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <FormControl component='fieldset' fullWidth>
          <RadioGroup
            value={respostas[currentQuestion.id] || ''}
            onChange={e =>
              handleRespostaChange(currentQuestion.id, e.target.value)
            }
          >
            {currentQuestion.alternativas.map(alternativa => (
              <FormControlLabel
                key={alternativa.id}
                value={alternativa.id}
                control={<Radio />}
                label={
                  <Box sx={{ py: 1 }}>
                    <Typography variant='body1'>
                      {alternativa.ordem}. {alternativa.texto}
                    </Typography>
                    {alternativa.imagem_url && (
                      <Box sx={{ mt: 1 }}>
                        <img
                          src={alternativa.imagem_url}
                          alt={`Alternativa ${alternativa.ordem}`}
                          style={{ maxWidth: 200, borderRadius: 4 }}
                        />
                      </Box>
                    )}
                  </Box>
                }
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  px: 2,
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
            Selecione uma alternativa para continuar
          </Alert>
        )}
      </Paper>

      {/* Navegação */}
      <Paper sx={{ p: 2 }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Button
            startIcon={<NavigateBefore />}
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Anterior
          </Button>

          <Stack direction='row' spacing={1}>
            {questoes.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: respostas[questoes[index].id]
                    ? 'success.main'
                    : index === currentQuestionIndex
                      ? 'primary.main'
                      : 'action.disabled',
                  cursor: 'pointer',
                }}
                onClick={() => setCurrentQuestionIndex(index)}
              />
            ))}
          </Stack>

          {currentQuestionIndex < questoes.length - 1 ? (
            <Button
              endIcon={<NavigateNext />}
              onClick={handleNext}
              variant='contained'
              disabled={!respostas[currentQuestion.id]}
            >
              Próxima
            </Button>
          ) : (
            <Button
              endIcon={<CheckCircle />}
              onClick={handleFinalizarTentativa}
              variant='contained'
              color='success'
              disabled={!todasRespondidas || finalizando}
            >
              {finalizando ? 'Finalizando...' : 'Finalizar Avaliação'}
            </Button>
          )}
        </Stack>
      </Paper>

      {/* Botão de Cancelar (opcional) */}
      {onCancel && (
        <Box textAlign='center' mt={2}>
          <Button
            startIcon={<Cancel />}
            onClick={onCancel}
            color='error'
            variant='text'
            size='small'
          >
            Cancelar Avaliação
          </Button>
        </Box>
      )}
    </Box>
  )
}
