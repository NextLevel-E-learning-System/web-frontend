import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import type { AttemptForReview } from '@/api/assessments'

interface AssessmentReviewSummaryProps {
  review: AttemptForReview
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

const resolveOptions = (raw: unknown): string[] => {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return (raw as unknown[]).filter(
      (item): item is string => typeof item === 'string'
    )
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      const trimmed = raw.trim()
      if (trimmed.includes(';')) {
        return trimmed
          .split(';')
          .map(opt => opt.trim())
          .filter(Boolean)
      }
    }
  }

  return []
}

export default function AssessmentReviewSummary({
  review,
}: AssessmentReviewSummaryProps) {
  const dissertativas = review.questoes_dissertativas || []
  const objetivas = review.respostas_objetivas || []

  return (
    <Stack gap={3}>
      {objetivas.length > 0 && (
        <Paper
          variant='outlined'
          sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 1 }}
        >
          <Stack gap={2.5}>
            {objetivas.map((questao, index) => {
              const respostaAluno = questao.resposta_funcionario || '—'
              const respostaCorreta = questao.resposta_correta || '—'
              const pontuacao =
                typeof questao.pontuacao === 'number' ? questao.pontuacao : 0
              const acertou =
                normalize(respostaAluno) === normalize(respostaCorreta)

              const opcoesBase = resolveOptions(questao.opcoes_resposta)
              const opcoes =
                opcoesBase.length > 0
                  ? opcoesBase
                  : questao.tipo === 'VERDADEIRO_FALSO'
                    ? ['Verdadeiro', 'Falso']
                    : []

              return (
                <Paper
                  key={questao.questao_id}
                  variant='outlined'
                  sx={{
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 1,
                    borderColor: acertou ? 'success.light' : 'divider',
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
                        label={`Pontuação: ${pontuacao}`}
                        color='success'
                        variant='filled'
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
                                borderRadius: 1,
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
            {dissertativas.length > 0 && (
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
                        borderRadius: 1,
                      }}
                    >
                      <Stack gap={2}>
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          justifyContent='space-between'
                          gap={1.5}
                        >
                          <Stack gap={0.5}>
                            <Typography
                              variant='overline'
                              color='text.secondary'
                            >
                              Dissertativa • Peso {questao.peso}
                            </Typography>
                            <Typography variant='subtitle2' fontWeight={600}>
                              {index + 1}. {questao.enunciado}
                            </Typography>
                          </Stack>
                          <Chip
                            label={`Pontuação: ${pontuacao}`}
                            color='success'
                            variant='filled'
                            sx={{
                              alignSelf: { xs: 'flex-start', md: 'center' },
                            }}
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
                            Feedback
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
            )}
          </Stack>
        </Paper>
      )}
    </Stack>
  )
}
