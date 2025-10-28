import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  Chip,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  RateReview as ReviewIcon,
  CheckCircle as ApproveIcon,
  Info as InfoIcon,
  CheckCircle,
} from '@mui/icons-material'
import { toast } from 'react-toastify'
import {
  usePendingReviews,
  useAttemptForReview,
  useFinalizeReview,
} from '@/api/assessments'

interface Props {
  cursoCodigo: string
}

interface QuestionScore {
  resposta_id: string
  pontuacao: number
}

export default function CourseReviewsPanel({ cursoCodigo }: Props) {
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean
    tentativaId?: string
  }>({ open: false })
  const [feedbackGeral, setFeedbackGeral] = useState('')
  const [questionScores, setQuestionScores] = useState<QuestionScore[]>([])

  // Buscar reviews pendentes
  const { data: pendingReviews = [], isLoading: loadingReviews } =
    usePendingReviews(cursoCodigo)

  // Buscar detalhes da tentativa para revisão
  const { data: attemptDetails, isLoading: loadingAttempt } =
    useAttemptForReview(
      reviewDialog.tentativaId || '',
      !!reviewDialog.tentativaId
    )

  // Mutation para finalizar revisão
  const finalizeReview = useFinalizeReview()

  const handleOpenReview = (tentativaId: string) => {
    setReviewDialog({ open: true, tentativaId })
    setQuestionScores([])
    setFeedbackGeral('')
  }

  const handleCloseReview = () => {
    setReviewDialog({ open: false })
    setFeedbackGeral('')
    setQuestionScores([])
  }

  const handleScoreChange = (respostaId: string, pontuacao: number) => {
    setQuestionScores(prev => {
      const existing = prev.find(s => s.resposta_id === respostaId)
      if (existing) {
        return prev.map(s =>
          s.resposta_id === respostaId ? { ...s, pontuacao } : s
        )
      }
      return [...prev, { resposta_id: respostaId, pontuacao }]
    })
  }

  const handleSubmitReview = async () => {
    if (!reviewDialog.tentativaId || !attemptDetails) return

    // Verificar se todas as questões foram pontuadas
    const questoesDissertativas = attemptDetails.questoes_dissertativas || []
    const faltamNotas = questoesDissertativas.some(
      q => !questionScores.find(s => s.resposta_id === q.resposta_id)
    )

    if (faltamNotas) {
      toast.error('Por favor, avalie todas as questões dissertativas')
      return
    }

    try {
      const result = await finalizeReview.mutateAsync({
        tentativaId: reviewDialog.tentativaId,
        input: {
          correcoes: questionScores,
          feedback_geral: feedbackGeral || undefined,
        },
      })

      // Usar a mensagem que vem da API
      if (result.passou) {
        toast.success(result.mensagem || 'Avaliação aprovada com sucesso!')
      } else {
        toast.info(result.mensagem || 'Avaliação finalizada')
      }

      handleCloseReview()
    } catch (error) {
      console.error('Erro ao finalizar revisão:', error)
      toast.error('Erro ao finalizar revisão. Tente novamente.')
    }
  }

  if (loadingReviews) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Stack
        direction='row'
        justifyContent='space-between'
        alignItems='center'
        mb={3}
      >
        <Box>
          <Typography variant='h6' gutterBottom>
            📝 Correções Pendentes
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Avaliações aguardando correção de questões dissertativas
          </Typography>
        </Box>
        <Chip
          label={`${pendingReviews.length} pendente${pendingReviews.length !== 1 ? 's' : ''}`}
          color='warning'
          size='small'
        />
      </Stack>

      {/* Lista de Correções Pendentes */}
      {pendingReviews.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant='h6' gutterBottom>
            Nenhuma correção pendente
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Todas as avaliações foram corrigidas!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant='outlined'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Aluno</TableCell>
                <TableCell>Avaliação</TableCell>
                <TableCell align='center'>Questões Dissertativas</TableCell>
                <TableCell align='center'>Data de Submissão</TableCell>
                <TableCell align='center'>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingReviews.map(review => (
                <TableRow key={review.tentativa_id} hover>
                  <TableCell>
                    <Stack direction='row' alignItems='center' gap={1.5}>
                      <Avatar sx={{ width: 36, height: 36 }}>
                        {review.funcionario.nome.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          {review.funcionario.nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {review.funcionario.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' fontWeight={500}>
                      {review.avaliacao_titulo}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {review.avaliacao_codigo}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Chip
                      label={`${review.questoes_dissertativas} questão${review.questoes_dissertativas !== 1 ? 'ões' : ''}`}
                      size='small'
                      color='primary'
                      variant='outlined'
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Typography variant='caption'>
                      {new Date(review.data_submissao).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Button
                      variant='contained'
                      size='small'
                      startIcon={<ReviewIcon />}
                      onClick={() => handleOpenReview(review.tentativa_id)}
                    >
                      Corrigir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog de Correção */}
      <Dialog
        open={reviewDialog.open}
        onClose={handleCloseReview}
        maxWidth='md'
        fullWidth
      >
        <DialogTitle>
          <Stack direction='row' alignItems='center' gap={1}>
            <ReviewIcon color='primary' />
            Corrigir Questão Dissertativa
          </Stack>
        </DialogTitle>
        <DialogContent>
          {loadingAttempt ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : attemptDetails ? (
            <Stack gap={3} sx={{ mt: 1 }}>
              {/* Info da Tentativa */}
              <Alert severity='info' icon={<InfoIcon />}>
                <Typography variant='caption'>
                  Aluno: {attemptDetails.funcionario.nome} • Submetido em:{' '}
                  {new Date(attemptDetails.tentativa.data_fim).toLocaleString(
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
              </Alert>

              {/* Questões Dissertativas */}
              {attemptDetails.questoes_dissertativas.map(questao => {
                return (
                  <Paper
                    key={questao.resposta_id}
                    variant='outlined'
                    sx={{ p: 2 }}
                  >
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                      mb={1}
                    >
                      <Typography variant='subtitle2' fontWeight={600}>
                        Questão peso: {questao.peso}
                      </Typography>
                      <Stack direction='row' alignItems='center' gap={1}>
                        <Typography variant='body2' fontWeight={500}>
                          Nota:
                        </Typography>
                        <TextField
                          type='number'
                          placeholder='0-100'
                          onChange={e => {
                            const value = parseFloat(e.target.value) || 0
                            const clamped = Math.max(0, Math.min(100, value))
                            handleScoreChange(questao.resposta_id, clamped)
                          }}
                          inputProps={{
                            min: 0,
                            max: 100,
                          }}
                          variant='standard'
                        />
                      </Stack>
                    </Stack>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      paragraph
                    >
                      {questao.enunciado}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      gutterBottom
                    >
                      Resposta do Aluno:
                    </Typography>
                    <Paper sx={{ p: 1.5, bgcolor: 'grey.50', mt: 1 }}>
                      <Typography
                        variant='body2'
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {questao.resposta_funcionario}
                      </Typography>
                    </Paper>
                  </Paper>
                )
              })}

              {/* Feedback Geral */}
              <TextField
                label='Feedback Personalizado (Opcional)'
                multiline
                rows={4}
                fullWidth
                value={feedbackGeral}
                onChange={e => setFeedbackGeral(e.target.value)}
                placeholder='Escreva um feedback geral para o aluno sobre o desempenho na avaliação...'
              />
            </Stack>
          ) : (
            <Alert severity='error'>
              Erro ao carregar detalhes da tentativa
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCloseReview}
            disabled={finalizeReview.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant='contained'
            color='success'
            startIcon={<ApproveIcon />}
            onClick={handleSubmitReview}
            disabled={finalizeReview.isPending || loadingAttempt}
          >
            {finalizeReview.isPending ? 'Finalizando...' : 'Finalizar Correção'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
