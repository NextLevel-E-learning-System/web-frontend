import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import type { AttemptForReview } from '@/api/assessments'

interface AssessmentReviewSummaryProps {
  review: AttemptForReview
  finalScore?: number | null
}

export default function AssessmentReviewSummary({
  review,
  finalScore,
}: AssessmentReviewSummaryProps) {
  const notaFinal =
    finalScore ??
    (typeof review.tentativa.nota_obtida === 'number'
      ? review.tentativa.nota_obtida
      : null)

  const notaMinima = review.avaliacao.nota_minima
  const status = review.tentativa.status
  const dissertativas = review.questoes_dissertativas || []
  const objetivas = review.respostas_objetivas || []

  return (
    <Stack gap={3}>
      {objetivas.length > 0 && (
        <Paper variant='outlined' sx={{ p: 3 }}>
          <Typography variant='subtitle1' fontWeight={700} gutterBottom>
            Questões Objetivas
          </Typography>
          <Stack gap={2}>
            {objetivas.map((questao, index) => {
              const respostaAluno = questao.resposta_funcionario || '—'
              const respostaCorreta = questao.resposta_correta || '—'
              const pontuacao =
                typeof questao.pontuacao === 'number' ? questao.pontuacao : 0
              const acertou =
                respostaAluno.trim().toLowerCase() ===
                respostaCorreta.trim().toLowerCase()

              return (
                <Paper
                  key={questao.questao_id}
                  variant='outlined'
                  sx={{ p: 2, bgcolor: 'grey.50' }}
                >
                  <Stack gap={1.5}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent='space-between'
                      gap={1}
                    >
                      <Typography variant='subtitle2' fontWeight={600}>
                        Questão {index + 1} • Peso: {questao.peso}
                      </Typography>
                      <Chip
                        label={`Pontuação: ${pontuacao.toFixed(1)}%`}
                        color={acertou ? 'success' : 'error'}
                        variant='outlined'
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                      />
                    </Stack>

                    <Typography variant='body2'>{questao.enunciado}</Typography>

                    <Divider flexItem />

                    <Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block' }}
                      >
                        Sua resposta
                      </Typography>
                      <Typography
                        variant='body2'
                        color={acertou ? 'success.main' : 'error.main'}
                        fontWeight={600}
                      >
                        {respostaAluno}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block' }}
                      >
                        Resposta correta
                      </Typography>
                      <Typography variant='body2' fontWeight={600}>
                        {respostaCorreta}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        </Paper>
      )}

      {dissertativas.length > 0 && (
        <Paper variant='outlined' sx={{ p: 3 }}>
          <Typography variant='subtitle1' fontWeight={700} gutterBottom>
            Questões Dissertativas
          </Typography>
          <Stack gap={2}>
            {dissertativas.map((questao, index) => {
              const pontuacao =
                typeof questao.pontuacao_atual === 'number'
                  ? questao.pontuacao_atual
                  : 0

              return (
                <Paper
                  key={questao.resposta_id}
                  variant='outlined'
                  sx={{ p: 2, bgcolor: 'grey.50' }}
                >
                  <Stack gap={1.5}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent='space-between'
                      gap={1}
                    >
                      <Typography variant='subtitle2' fontWeight={600}>
                        Questão {index + 1} • Peso: {questao.peso}
                      </Typography>
                      <Chip
                        label={`Pontuação: ${pontuacao.toFixed(1)}%`}
                        color={pontuacao >= 70 ? 'success' : 'warning'}
                        variant='outlined'
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                      />
                    </Stack>

                    <Typography variant='body2'>{questao.enunciado}</Typography>

                    <Divider flexItem />

                    <Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block' }}
                      >
                        Sua resposta
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {questao.resposta_funcionario || '—'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block' }}
                      >
                        Feedback do avaliador
                      </Typography>
                      <Typography variant='body2'>
                        {questao.feedback_atual ||
                          'Nenhum feedback disponível.'}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        </Paper>
      )}

      {objetivas.length === 0 && dissertativas.length === 0 && (
        <Paper variant='outlined' sx={{ p: 3 }}>
          <Typography variant='body2' color='text.secondary'>
            Nenhuma questão para revisar no momento.
          </Typography>
        </Paper>
      )}
    </Stack>
  )
}
