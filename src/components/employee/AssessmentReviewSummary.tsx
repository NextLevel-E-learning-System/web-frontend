import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import type { AttemptForReview } from '@/api/assessments'

interface AssessmentReviewSummaryProps {
  review: AttemptForReview
  finalScore?: number | null
}

const formatQuestionType = (tipo?: string) => {
  switch (tipo) {
    case 'MULTIPLA_ESCOLHA':
      return 'Múltipla Escolha'
    case 'VERDADEIRO_FALSO':
      return 'Verdadeiro ou Falso'
    case 'DISSERTATIVA':
      return 'Dissertativa'
    default:
      return tipo || 'Questão'
  }
}

const normalize = (value?: string | null) => (value || '').trim().toLowerCase()

export default function AssessmentReviewSummary({
  review,
  finalScore,
}: AssessmentReviewSummaryProps) {
  const notaFinal =
    typeof finalScore === 'number'
      ? finalScore
      : typeof review.tentativa.nota_obtida === 'number'
        ? review.tentativa.nota_obtida
        : null

  const notaMinima = review.avaliacao.nota_minima
  const status = review.tentativa.status
  const dissertativas = review.questoes_dissertativas || []
  const objetivas = review.respostas_objetivas || []
  const totalQuestoes = dissertativas.length + objetivas.length

  return (
    <Stack gap={3}>
      <Paper
        variant='outlined'
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent='space-between'
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={2}
        >
          <Stack gap={0.5}>
            <Typography variant='h6' fontWeight={700}>
              Revisão da Avaliação
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Confira suas respostas, veja o gabarito e entenda os feedbacks do
              instrutor.
            </Typography>
          </Stack>

          <Stack direction='row' alignItems='center' gap={1} flexWrap='wrap'>
            <Chip
              label={status === 'APROVADO' ? '✅ Aprovado' : status}
              color={status === 'APROVADO' ? 'success' : 'default'}
              variant='filled'
              sx={{ fontWeight: 600 }}
            />
            {typeof notaFinal === 'number' && (
              <Chip
                label={`Nota final: ${notaFinal.toFixed(1)}%`}
                color={
                  typeof notaMinima === 'number' && notaFinal < notaMinima
                    ? 'warning'
                    : 'primary'
                }
                variant='outlined'
                sx={{ fontWeight: 600 }}
              />
            )}
            {typeof notaMinima === 'number' && (
              <Chip label={`Nota mínima: ${notaMinima}%`} variant='outlined' />
            )}
            {totalQuestoes > 0 && (
              <Chip
                label={`${totalQuestoes} questão${totalQuestoes > 1 ? 's' : ''}`}
              />
            )}
          </Stack>
        </Stack>
      </Paper>

      {objetivas.length > 0 && (
        <Paper
          variant='outlined'
          sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2 }}
        >
          <Typography variant='subtitle1' fontWeight={700} gutterBottom>
            Questões Objetivas
          </Typography>
          <Stack gap={2.5}>
            {objetivas.map((questao, index) => {
              const respostaAluno = questao.resposta_funcionario || '—'
              const respostaCorreta = questao.resposta_correta || '—'
              const pontuacao =
                typeof questao.pontuacao === 'number' ? questao.pontuacao : 0
              const acertou =
                normalize(respostaAluno) === normalize(respostaCorreta)

              const opcoes =
                questao.opcoes_resposta && questao.opcoes_resposta.length > 0
                  ? questao.opcoes_resposta
                  : questao.tipo === 'VERDADEIRO_FALSO'
                    ? ['Verdadeiro', 'Falso']
                    : []

              return (
                <Paper
                  key={questao.questao_id}
                  variant='outlined'
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 2,
                    borderColor: acertou ? 'success.light' : 'divider',
                    bgcolor: acertou ? 'rgba(46,125,50,0.06)' : 'grey.50',
                  }}
                >
                  <Stack gap={2}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent='space-between'
                      gap={1.5}
                    >
                      <Stack gap={0.5}>
                        <Typography variant='overline' color='text.secondary'>
                          {formatQuestionType(questao.tipo)} • Peso{' '}
                          {questao.peso}
                        </Typography>
                        <Typography variant='subtitle2' fontWeight={600}>
                          {index + 1}. {questao.enunciado}
                        </Typography>
                      </Stack>
                      <Chip
                        label={`Pontuação: ${pontuacao.toFixed(1)}%`}
                        color={acertou ? 'success' : 'warning'}
                        variant={acertou ? 'filled' : 'outlined'}
                        sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                      />
                    </Stack>

                    {opcoes.length > 0 && (
                      <Stack gap={1.2}>
                        {opcoes.map((opcao, idx) => {
                          const letra = String.fromCharCode(65 + idx)
                          const ehCorreta =
                            normalize(opcao) === normalize(respostaCorreta)
                          const ehEscolhida =
                            normalize(opcao) === normalize(respostaAluno)

                          return (
                            <Paper
                              key={opcao + idx}
                              variant='outlined'
                              sx={{
                                p: 1.4,
                                borderRadius: 1.5,
                                borderColor: ehCorreta
                                  ? 'success.main'
                                  : ehEscolhida
                                    ? 'primary.main'
                                    : 'divider',
                                bgcolor: ehCorreta
                                  ? 'rgba(46,125,50,0.08)'
                                  : ehEscolhida
                                    ? 'rgba(25,118,210,0.08)'
                                    : 'background.paper',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1.5,
                              }}
                            >
                              <Stack
                                direction='row'
                                gap={1.5}
                                alignItems='center'
                              >
                                <Chip
                                  label={letra}
                                  size='small'
                                  color={ehCorreta ? 'success' : 'default'}
                                  variant={ehCorreta ? 'filled' : 'outlined'}
                                  sx={{ fontWeight: 600, minWidth: 32 }}
                                />
                                <Typography
                                  variant='body2'
                                  color={
                                    ehCorreta ? 'success.main' : 'text.primary'
                                  }
                                  fontWeight={ehCorreta ? 600 : 400}
                                >
                                  {opcao}
                                </Typography>
                              </Stack>

                              <Stack
                                direction='row'
                                gap={1}
                                alignItems='center'
                              >
                                {ehEscolhida && (
                                  <Chip
                                    label='Sua resposta'
                                    size='small'
                                    color={ehCorreta ? 'success' : 'primary'}
                                    variant='outlined'
                                  />
                                )}
                                {ehCorreta && (
                                  <Chip
                                    label='Correta'
                                    size='small'
                                    color='success'
                                    variant='filled'
                                  />
                                )}
                              </Stack>
                            </Paper>
                          )
                        })}
                      </Stack>
                    )}

                    {opcoes.length === 0 && (
                      <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            Sua resposta
                          </Typography>
                          <Typography
                            variant='body2'
                            color={acertou ? 'success.main' : 'primary.main'}
                            fontWeight={600}
                          >
                            {respostaAluno}
                          </Typography>
                        </Box>
                        <Divider orientation='vertical' flexItem />
                        <Box>
                          <Typography variant='caption' color='text.secondary'>
                            Gabarito
                          </Typography>
                          <Typography variant='body2' fontWeight={600}>
                            {respostaCorreta}
                          </Typography>
                        </Box>
                      </Stack>
                    )}
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        </Paper>
      )}

      {dissertativas.length > 0 && (
        <Paper
          variant='outlined'
          sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2 }}
        >
          <Typography variant='subtitle1' fontWeight={700} gutterBottom>
            Questões Dissertativas
          </Typography>
          <Stack gap={2.5}>
            {dissertativas.map((questao, index) => {
              const pontuacao =
                typeof questao.pontuacao_atual === 'number'
                  ? questao.pontuacao_atual
                  : 0

              return (
                <Paper
                  key={questao.resposta_id}
                  variant='outlined'
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 2,
                    bgcolor: 'grey.50',
                  }}
                >
                  <Stack gap={2}>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent='space-between'
                      gap={1.5}
                    >
                      <Stack gap={0.5}>
                        <Typography variant='overline' color='text.secondary'>
                          Dissertativa • Peso {questao.peso}
                        </Typography>
                        <Typography variant='subtitle2' fontWeight={600}>
                          {index + 1}. {questao.enunciado}
                        </Typography>
                      </Stack>
                      <Chip
                        label={`Pontuação: ${pontuacao.toFixed(1)}%`}
                        color={pontuacao >= 70 ? 'success' : 'warning'}
                        variant={pontuacao >= 70 ? 'filled' : 'outlined'}
                        sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}
                      />
                    </Stack>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Sua resposta
                      </Typography>
                      <Paper
                        variant='outlined'
                        sx={{
                          mt: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                        }}
                      >
                        <Typography
                          variant='body2'
                          sx={{ whiteSpace: 'pre-wrap' }}
                        >
                          {questao.resposta_funcionario || '—'}
                        </Typography>
                      </Paper>
                    </Box>

                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Feedback do avaliador
                      </Typography>
                      <Paper
                        variant='outlined'
                        sx={{
                          mt: 1,
                          p: 1.5,
                          borderRadius: 1.5,
                          bgcolor: 'background.paper',
                          borderColor: questao.feedback_atual
                            ? 'primary.light'
                            : 'divider',
                        }}
                      >
                        <Typography variant='body2'>
                          {questao.feedback_atual ||
                            'Nenhum feedback disponibilizado para esta questão.'}
                        </Typography>
                      </Paper>
                    </Box>
                  </Stack>
                </Paper>
              )
            })}
          </Stack>
        </Paper>
      )}

      {objetivas.length === 0 && dissertativas.length === 0 && (
        <Paper
          variant='outlined'
          sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2 }}
        >
          <Typography variant='body2' color='text.secondary'>
            Nenhuma questão para revisar no momento.
          </Typography>
        </Paper>
      )}
    </Stack>
  )
}
