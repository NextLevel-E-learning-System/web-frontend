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
  useIniciarTentativa,
  useResponderQuestao,
  useFinalizarTentativa,
  useUserAttempts,
  type Tentativa,
  type Questao,
} from '@/api/assessments'

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
  const [tentativaIniciada, setTentativaIniciada] = useState(false)
  const [tentativa, setTentativa] = useState<Tentativa | null>(null)
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [tempoRestante, setTempoRestante] = useState<number | null>(null)
  const [finalizando, setFinalizando] = useState(false)

  const iniciarMutation = useIniciarTentativa()
  const finalizarMutation = useFinalizarTentativa()

  // Buscar histórico de tentativas
  const { data: userAttempts = [], isLoading: loadingAttempts } =
    useUserAttempts(avaliacaoId, true)

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

  const handleIniciarTentativa = () => {
    iniciarMutation.mutate(
      { avaliacaoId, funcionarioId },
      {
        onSuccess: data => {
          setTentativa(data.tentativa)
          setQuestoes(data.questoes)
          setTentativaIniciada(true)

          // Configurar timer se houver tempo limite
          if (data.tentativa.tempo_limite_minutos) {
            setTempoRestante(data.tentativa.tempo_limite_minutos * 60)
          }
        },
        onError: error => {
          console.error('Erro ao iniciar tentativa:', error)
        },
      }
    )
  }

  // Timer countdown
  useEffect(() => {
    if (tempoRestante === null || tempoRestante <= 0) return

    const interval = setInterval(() => {
      setTempoRestante(prev => {
        if (prev === null || prev <= 1) {
          // Tempo esgotado - finalizar automaticamente
         
           clearInterval(interval)
            finalizarMutation()
         
            
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempoRestante])

  const currentQuestion = questoes[currentQuestionIndex]

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

    try {
      await finalizarMutation.mutateAsync({
        tentativa_id: assessmentData.tentativa.id,
        respostas: Object.entries(respostas).map(([questao_id, resposta]) => ({
          questao_id,
          resposta_funcionario: resposta,
        })),
      })

  
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

  // Tela de informações (antes de iniciar)
  if (!tentativaIniciada) {
    return (
      <Box>
        <Paper sx={{ p: 4 }}>
          <Typography variant='h5' gutterBottom fontWeight={600}>
            Informações da Avaliação
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
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Importante:</strong> Todos os módulos obrigatórios
                      devem estar concluídos antes de iniciar esta avaliação.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Tempo limite:</strong>{' '}
                      {tentativa?.tempo_limite_minutos || 'N/A'} minutos
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Nota mínima:</strong>{' '}
                      {tentativa?.nota_minima || 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>Tentativas permitidas:</strong>{' '}
                      {tentativa?.tentativas_permitidas || 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      Novas tentativas são permitidas se você não atingir a nota
                      mínima para aprovação.
                    </Typography>
                  </Box>
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
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    pt: 2,
                  }}
                >
                  {onCancel && (
                    <Button variant='outlined' onClick={onCancel}>
                      Voltar
                    </Button>
                  )}
                  <Button
                    variant='contained'
                    size='large'
                    startIcon={
                      iniciarMutation.isPending ? (
                        <CircularProgress size={20} color='inherit' />
                      ) : (
                        <PlayArrow />
                      )
                    }
                    disabled={iniciarMutation.isPending}
                    onClick={handleIniciarTentativa}
                    sx={{ minWidth: 200 }}
                  >
                    {iniciarMutation.isPending
                      ? 'Iniciando...'
                      : 'Iniciar Avaliação'}
                  </Button>
                </Box>
              </>
            )}
          </Stack>
        </Paper>
      </Box>
    )
  }

  // Loading/Error states (após iniciar)
  if (!tentativa || questoes.length === 0) {
    return (
      <Box textAlign='center' py={8}>
        <LinearProgress sx={{ mb: 2 }} />
        <Typography>Carregando questões...</Typography>
      </Box>
    )
  }

  // Tela do quiz (após iniciar)
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
              {questoes.map((questao, index) => {
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
                startIcon={<CheckCircle />}
                onClick={handleFinalizarTentativa}
                disabled={!todasRespondidas || finalizando}
              >
                {finalizando ? 'Finalizando...' : 'Finalizar Avaliação'}
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

            <FormControl component='fieldset' fullWidth sx={{ flex: 1 }}>
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
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                Anterior
              </Button>

              <Button
                endIcon={<NavigateNext />}
                onClick={handleNext}
                variant='contained'
                disabled={currentQuestionIndex === questoes.length - 1}
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
