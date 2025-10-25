import { useState, useMemo } from 'react'
import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material'
import ConfirmationDialog from '@/components/common/ConfirmationDialog'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ListAltIcon from '@mui/icons-material/ListAlt'
import { Quiz } from '@mui/icons-material'
import AssessmentFormDialog from './AssessmentFormDialog'
import QuestionFormDialog from './QuestionFormDialog'
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
  useAssessmentQuestions,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  type Question,
  type Assessment,
} from '@/api/assessments'

interface Props {
  cursoCodigo: string
  moduloId: string
}

// Função para formatar o tipo de questão
const formatQuestionType = (tipo: string) => {
  switch (tipo) {
    case 'MULTIPLA_ESCOLHA':
      return 'Múltipla Escolha'
    case 'VERDADEIRO_FALSO':
      return 'Verdadeiro ou Falso'
    case 'DISSERTATIVA':
      return 'Dissertativa'
    default:
      return tipo
  }
}

export default function ModuleAssessmentsPanel({
  cursoCodigo,
  moduloId,
}: Props) {
  const { data: assessments = [], isLoading } = useAssessments({
    curso_id: cursoCodigo,
    modulo_id: moduloId,
  })
  const createAssessment = useCreateAssessment()
  const deleteAssessment = useDeleteAssessment()

  const [assessmentDialog, setAssessmentDialog] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    codigo?: string
  }>({ open: false, mode: 'create' })
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(
    null
  )
  const [questionDialog, setQuestionDialog] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    assessmentCodigo?: string
    questionId?: string
  }>({ open: false, mode: 'create' })

  // Atualização de avaliação
  const assessmentCodigoBeingEdited =
    assessmentDialog.mode === 'edit' ? assessmentDialog.codigo : undefined
  const updateAssessmentHook = useUpdateAssessment(
    assessmentCodigoBeingEdited || ''
  )

  // Questões
  const activeAssessmentForQuestions =
    questionDialog.assessmentCodigo || expandedAssessment || ''
  const questionsQuery = useAssessmentQuestions(activeAssessmentForQuestions, {
    enabled:
      !!activeAssessmentForQuestions &&
      expandedAssessment === activeAssessmentForQuestions,
  })
  const { mutateAsync: createQuestion } = useCreateQuestion(
    activeAssessmentForQuestions
  )
  const { mutateAsync: deleteQuestion } = useDeleteQuestion(
    activeAssessmentForQuestions
  )
  const updateQuestionHook = useUpdateQuestion(
    activeAssessmentForQuestions,
    questionDialog.questionId || ''
  )

  const currentAssessment = useMemo(
    () => assessments.find(a => a.codigo === assessmentDialog.codigo),
    [assessments, assessmentDialog.codigo]
  )
  const [confirm, setConfirm] = useState<{
    open: boolean
    kind: 'assessment' | 'question' | 'toggle-assessment'
    id: string
    assessment?: Assessment
  } | null>(null)

  // Hook para toggle de status
  const toggleAssessmentHook = useUpdateAssessment(
    confirm?.kind === 'toggle-assessment' ? confirm.id : ''
  )

  // Função para alternar status ativo/inativo
  const handleToggleAssessmentStatus = (assessment: Assessment) => {
    setConfirm({
      open: true,
      kind: 'toggle-assessment',
      id: assessment.codigo,
      assessment,
    })
  }

  return (
    <Box>
      <Stack direction='row' justifyContent='end' alignItems='center'>
        <Button
          size='small'
          startIcon={<AddIcon />}
          onClick={() => setAssessmentDialog({ open: true, mode: 'create' })}
          variant='text'
        >
          Nova Avaliação
        </Button>
      </Stack>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={26} />
        </Box>
      ) : assessments.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          Nenhuma avaliação neste módulo.
        </Typography>
      ) : (
        <Stack gap={1}>
          {assessments.map(a => (
            <Stack key={a.codigo} gap={1}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(59,130,246,0.08)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(59,130,246,0.12)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Quiz sx={{ color: 'primary.main', fontSize: 32 }} />
                <Stack sx={{ flex: 1 }}>
                  <Typography variant='body1' fontWeight={600}>
                    {a.titulo}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    Código: {a.codigo} · Nota mínima: {a.nota_minima ?? '-'} ·
                    Tempo: {a.tempo_limite ?? '-'} min
                  </Typography>
                  <Stack direction='row' gap={1} mt={0.5} flexWrap='wrap'>
                    {!a.ativo && <Chip size='small' label='Inativa' />}
                    {a.tentativas_permitidas && (
                      <Chip
                        size='small'
                        variant='outlined'
                        label={`Tentativas ${a.tentativas_permitidas}`}
                      />
                    )}
                    {a.nota_minima != null && (
                      <Chip
                        size='small'
                        variant='outlined'
                        label={`Nota mínima ${a.nota_minima}%`}
                      />
                    )}
                  </Stack>
                </Stack>
                <Stack direction='row' gap={0.5}>
                  <Tooltip title='Questões'>
                    <IconButton
                      size='small'
                      onClick={() =>
                        setExpandedAssessment(p =>
                          p === a.codigo ? null : a.codigo
                        )
                      }
                    >
                      <ListAltIcon fontSize='inherit' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Editar'>
                    <IconButton
                      size='small'
                      onClick={() =>
                        setAssessmentDialog({
                          open: true,
                          mode: 'edit',
                          codigo: a.codigo,
                        })
                      }
                    >
                      <EditIcon fontSize='inherit' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={a.ativo ? 'Inativar' : 'Ativar'}>
                    <IconButton
                      size='small'
                      onClick={() => handleToggleAssessmentStatus(a)}
                    >
                      {a.ativo ? (
                        <DeleteIcon fontSize='inherit' />
                      ) : (
                        <CheckCircleIcon fontSize='inherit' />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
              {expandedAssessment === a.codigo && (
                <Box
                  sx={{
                    mt: 1.5,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.default',
                    border: theme => `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() =>
                      setQuestionDialog({
                        open: true,
                        mode: 'create',
                        assessmentCodigo: a.codigo,
                      })
                    }
                    variant='text'
                  >
                    Nova questão
                  </Button>

                  {questionsQuery.isLoading ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        py: 2,
                      }}
                    >
                      <CircularProgress size={20} />
                    </Box>
                  ) : questionsQuery.data?.length === 0 ? (
                    <Typography variant='caption' color='text.secondary'>
                      Nenhuma questão.
                    </Typography>
                  ) : (
                    <Stack gap={1}>
                      {questionsQuery?.data?.map((q: Question) => (
                        <Paper
                          key={q.id}
                          variant='outlined'
                          sx={{
                            p: 1.5,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 1,
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant='body2'
                                fontWeight={600}
                                sx={{ mb: 0.5 }}
                              >
                                {q.enunciado}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ display: 'block', mb: 1 }}
                              >
                                Tipo: {formatQuestionType(q.tipo)}
                                {' - '}
                                Peso: {q.peso}
                              </Typography>

                              {/* Mostrar opções de resposta para múltipla escolha */}
                              {q.tipo === 'MULTIPLA_ESCOLHA' &&
                                q.opcoes_resposta && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                      sx={{ display: 'block', mb: 0.5 }}
                                    >
                                      Opções:
                                    </Typography>
                                    <Stack gap={0.5}>
                                      {q.opcoes_resposta.map(
                                        (opcao: string, idx: number) => (
                                          <Box
                                            key={idx}
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                            }}
                                          >
                                            <Chip
                                              size='small'
                                              label={String.fromCharCode(
                                                65 + idx
                                              )} // A, B, C, D...
                                              variant={
                                                opcao === q.resposta_correta
                                                  ? 'filled'
                                                  : 'outlined'
                                              }
                                              color={
                                                opcao === q.resposta_correta
                                                  ? 'success'
                                                  : 'default'
                                              }
                                              sx={{
                                                minWidth: 32,
                                                fontSize: '0.7rem',
                                              }}
                                            />
                                            <Typography
                                              variant='caption'
                                              sx={{
                                                fontWeight:
                                                  opcao === q.resposta_correta
                                                    ? 600
                                                    : 400,
                                                color:
                                                  opcao === q.resposta_correta
                                                    ? 'success.main'
                                                    : 'text.secondary',
                                              }}
                                            >
                                              {opcao}
                                            </Typography>
                                          </Box>
                                        )
                                      )}
                                    </Stack>
                                  </Box>
                                )}

                              {/* Mostrar opções para Verdadeiro/Falso */}
                              {q.tipo === 'VERDADEIRO_FALSO' &&
                                q.opcoes_resposta && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                      sx={{ display: 'block', mb: 0.5 }}
                                    >
                                      Afirmações:
                                    </Typography>
                                    <Stack gap={0.5}>
                                      {q.opcoes_resposta.map(
                                        (opcao: string, idx: number) => {
                                          // Parse do formato "texto::resposta"
                                          const [texto, resposta] =
                                            opcao.split('::')
                                          const respostasCorretas =
                                            q.resposta_correta?.split(',') || []
                                          const isCorrect =
                                            respostasCorretas[idx] === resposta

                                          return (
                                            <Box
                                              key={idx}
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                              }}
                                            >
                                              <Chip
                                                size='small'
                                                label={`${idx + 1}`}
                                                variant='outlined'
                                                sx={{
                                                  minWidth: 32,
                                                  fontSize: '0.7rem',
                                                }}
                                              />
                                              <Typography
                                                variant='caption'
                                                sx={{
                                                  flex: 1,
                                                  color: 'text.secondary',
                                                }}
                                              >
                                                {texto}
                                              </Typography>
                                              <Chip
                                                size='small'
                                                label={
                                                  resposta === 'V'
                                                    ? 'Verdadeiro'
                                                    : 'Falso'
                                                }
                                                color={
                                                  isCorrect
                                                    ? 'success'
                                                    : 'default'
                                                }
                                                variant={
                                                  isCorrect
                                                    ? 'filled'
                                                    : 'outlined'
                                                }
                                                sx={{
                                                  fontSize: '0.65rem',
                                                  fontWeight: isCorrect
                                                    ? 600
                                                    : 400,
                                                }}
                                              />
                                            </Box>
                                          )
                                        }
                                      )}
                                    </Stack>
                                  </Box>
                                )}

                              {/* Para dissertativa */}
                              {q.tipo === 'DISSERTATIVA' && (
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                  sx={{ mt: 1, fontStyle: 'italic' }}
                                >
                                  Questão dissertativa - correção manual
                                </Typography>
                              )}
                            </Box>

                            <Stack direction='row' gap={0.5}>
                              <Tooltip title='Editar'>
                                <IconButton
                                  size='small'
                                  onClick={() =>
                                    setQuestionDialog({
                                      open: true,
                                      mode: 'edit',
                                      assessmentCodigo: a.codigo,
                                      questionId: q.id,
                                    })
                                  }
                                >
                                  <EditIcon fontSize='inherit' />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Remover'>
                                <IconButton
                                  size='small'
                                  onClick={() =>
                                    setConfirm({
                                      open: true,
                                      kind: 'question',
                                      id: q.id,
                                    })
                                  }
                                >
                                  <DeleteIcon fontSize='inherit' />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                  <Box sx={{ textAlign: 'right', mt: 1 }}>
                    <Button
                      size='small'
                      onClick={() => setExpandedAssessment(null)}
                    >
                      Fechar
                    </Button>
                  </Box>
                </Box>
              )}
            </Stack>
          ))}
        </Stack>
      )}

      <AssessmentFormDialog
        open={assessmentDialog.open}
        mode={assessmentDialog.mode}
        cursoId={cursoCodigo}
        moduloId={moduloId}
        assessment={
          assessmentDialog.mode === 'edit' ? currentAssessment : undefined
        }
        onClose={() => setAssessmentDialog({ open: false, mode: 'create' })}
        onCreate={async data => {
          await createAssessment.mutateAsync(data)
        }}
        onUpdate={async (_codigo, data) => {
          if (assessmentCodigoBeingEdited) {
            await updateAssessmentHook.mutateAsync(data)
          }
        }}
      />

      <QuestionFormDialog
        open={questionDialog.open}
        mode={questionDialog.mode}
        avaliacaoCodigo={activeAssessmentForQuestions}
        question={questionsQuery.data?.find(
          q => q.id === questionDialog.questionId
        )}
        onClose={() => setQuestionDialog({ open: false, mode: 'create' })}
        onCreate={async q => {
          await createQuestion(q)
        }}
        onUpdate={async (_id, data) => {
          if (questionDialog.questionId) {
            await updateQuestionHook.mutateAsync(data)
          }
        }}
      />
      <ConfirmationDialog
        open={!!confirm?.open}
        title={
          confirm?.kind === 'assessment'
            ? 'Inativar avaliação'
            : confirm?.kind === 'toggle-assessment'
              ? confirm.assessment?.ativo
                ? 'Inativar avaliação'
                : 'Ativar avaliação'
              : 'Excluir questão'
        }
        message={
          confirm?.kind === 'assessment'
            ? 'Tem certeza que deseja inativar esta avaliação?'
            : confirm?.kind === 'toggle-assessment'
              ? confirm.assessment?.ativo
                ? 'Tem certeza que deseja inativar esta avaliação?'
                : 'Tem certeza que deseja ativar esta avaliação?'
              : 'Tem certeza que deseja excluir esta questão?'
        }
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return
          try {
            if (confirm.kind === 'assessment') {
              await deleteAssessment.mutateAsync(confirm.id)
            } else if (
              confirm.kind === 'toggle-assessment' &&
              confirm.assessment
            ) {
              await toggleAssessmentHook.mutateAsync({
                titulo: confirm.assessment.titulo,
                tempo_limite: confirm.assessment.tempo_limite
                  ? Number(confirm.assessment.tempo_limite)
                  : undefined,
                tentativas_permitidas: confirm.assessment.tentativas_permitidas
                  ? Number(confirm.assessment.tentativas_permitidas)
                  : undefined,
                nota_minima: confirm.assessment.nota_minima
                  ? Number(confirm.assessment.nota_minima)
                  : undefined,
                ativo: !confirm.assessment.ativo,
                modulo_id: confirm.assessment.modulo_id,
              })
            } else {
              await deleteQuestion(confirm.id)
            }
          } catch {
            /* empty */
          } finally {
            setConfirm(null)
          }
        }}
        confirmText={
          confirm?.kind === 'assessment'
            ? 'Inativar'
            : confirm?.kind === 'toggle-assessment'
              ? confirm.assessment?.ativo
                ? 'Inativar'
                : 'Ativar'
              : 'Excluir'
        }
      />
      <Divider sx={{ mt: 2 }} />
    </Box>
  )
}
