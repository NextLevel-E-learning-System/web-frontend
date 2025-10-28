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
  Rating,
} from '@mui/material'
import {
  RateReview as ReviewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
} from '@mui/icons-material'

interface PendingReview {
  tentativa_id: string
  avaliacao_codigo: string
  avaliacao_titulo: string
  funcionario: {
    id: string
    nome: string
    email: string
  }
  data_submissao: string
  questoes_dissertativas: number
  status: 'PENDENTE_REVISAO'
}

interface Props {
  cursoCodigo: string
}

export default function CourseReviewsPanel({ cursoCodigo }: Props) {
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean
    tentativaId?: string
  }>({ open: false })
  const [feedback, setFeedback] = useState('')
  const [selectedScore, setSelectedScore] = useState<number>(0)

  // Mock data - substituir por chamada real à API
  const pendingReviews: PendingReview[] = [
    {
      tentativa_id: '1',
      avaliacao_codigo: 'AV1',
      avaliacao_titulo: 'Avaliação Final - Módulo 1',
      funcionario: {
        id: '1',
        nome: 'João Silva',
        email: 'joao.silva@empresa.com',
      },
      data_submissao: '2025-10-26T14:30:00',
      questoes_dissertativas: 2,
      status: 'PENDENTE_REVISAO',
    },
    {
      tentativa_id: '2',
      avaliacao_codigo: 'AV2',
      avaliacao_titulo: 'Avaliação Final - Módulo 2',
      funcionario: {
        id: '2',
        nome: 'Maria Santos',
        email: 'maria.santos@empresa.com',
      },
      data_submissao: '2025-10-27T09:15:00',
      questoes_dissertativas: 1,
      status: 'PENDENTE_REVISAO',
    },
  ]

  const handleOpenReview = (tentativaId: string) => {
    setReviewDialog({ open: true, tentativaId })
    // Buscar detalhes da tentativa
  }

  const handleCloseReview = () => {
    setReviewDialog({ open: false })
    setFeedback('')
    setSelectedScore(0)
  }

  const handleSubmitReview = () => {
    // Implementar envio da correção
    console.log('Submeter revisão:', {
      tentativaId: reviewDialog.tentativaId,
      feedback,
      score: selectedScore,
    })
    handleCloseReview()
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
            📝 Fila de Correções Pendentes
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
            Corrigir Avaliação Dissertativa
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack gap={3} sx={{ mt: 1 }}>
            {/* Info da Tentativa */}
            <Alert severity='info' icon={<InfoIcon />}>
              <Typography variant='body2' fontWeight={600} gutterBottom>
                Informações da Tentativa
              </Typography>
              <Typography variant='caption'>
                Aluno: João Silva • Avaliação: AV1 • Submetido em: 26/10/2025
                14:30
              </Typography>
            </Alert>

            {/* Questão Dissertativa Exemplo */}
            <Paper variant='outlined' sx={{ p: 2 }}>
              <Typography variant='subtitle2' fontWeight={600} gutterBottom>
                Questão 1
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                Explique os principais conceitos de orientação a objetos em
                programação.
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant='caption' color='text.secondary' gutterBottom>
                Resposta do Aluno:
              </Typography>
              <Paper sx={{ p: 1.5, bgcolor: 'grey.50', mt: 1 }}>
                <Typography variant='body2'>
                  Os principais conceitos são: encapsulamento, herança,
                  polimorfismo e abstração. O encapsulamento protege os dados, a
                  herança permite reutilização de código...
                </Typography>
              </Paper>

              {/* Nota da Questão */}
              <Box sx={{ mt: 2 }}>
                <Typography variant='caption' gutterBottom>
                  Nota da Questão (Peso: 10 pontos)
                </Typography>
                <Rating
                  value={selectedScore}
                  onChange={(_, val) => setSelectedScore(val || 0)}
                  max={10}
                  size='large'
                />
              </Box>
            </Paper>

            {/* Feedback Geral */}
            <TextField
              label='Feedback Personalizado'
              multiline
              rows={4}
              fullWidth
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder='Escreva um feedback personalizado para o aluno sobre sua resposta...'
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseReview}>Cancelar</Button>
          <Button
            variant='outlined'
            color='error'
            startIcon={<RejectIcon />}
            onClick={() => {
              console.log('Reprovar')
              handleCloseReview()
            }}
          >
            Reprovar
          </Button>
          <Button
            variant='contained'
            color='success'
            startIcon={<ApproveIcon />}
            onClick={handleSubmitReview}
          >
            Aprovar e Finalizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
