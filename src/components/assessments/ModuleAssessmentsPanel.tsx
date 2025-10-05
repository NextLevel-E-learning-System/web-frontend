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
    kind: 'assessment' | 'question'
    id: string
  } | null>(null)

  return (
    <Paper variant='outlined' sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='h6'>Avaliações</Typography>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setAssessmentDialog({ open: true, mode: 'create' })}
          variant='text'
        >
          Nova Avaliação
        </Button>
      </Stack>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={26} />
        </Box>
      ) : assessments.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          Nenhuma avaliação neste módulo.
        </Typography>
      ) : (
        <Stack gap={1}>
          {assessments.map(a => (
            <Paper key={a.codigo} variant='outlined' sx={{ p: 1.5 }}>
              <Stack direction='row' alignItems='flex-start' gap={1}>
                <Quiz fontSize='small' />
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body2' fontWeight={600}>
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
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='center'
                        sx={{ mb: 1 }}
                      >
                        <Typography variant='h6'>Questões</Typography>
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
                      </Stack>
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
                                                      opcao ===
                                                      q.resposta_correta
                                                        ? 600
                                                        : 400,
                                                    color:
                                                      opcao ===
                                                      q.resposta_correta
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

                                  {/* Mostrar resposta para Verdadeiro/Falso */}
                                  {q.tipo === 'VERDADEIRO_FALSO' &&
                                    q.resposta_correta && (
                                      <Box sx={{ mt: 1 }}>
                                        <Typography
                                          variant='caption'
                                          color='text.secondary'
                                        >
                                          Resposta correta:
                                          <Chip
                                            size='small'
                                            label={q.resposta_correta}
                                            color='success'
                                            sx={{ ml: 1, fontSize: '0.7rem' }}
                                          />
                                        </Typography>
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
                </Box>
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
                  <Tooltip title='Inativar'>
                    <IconButton
                      size='small'
                      onClick={() =>
                        setConfirm({
                          open: true,
                          kind: 'assessment',
                          id: a.codigo,
                        })
                      }
                    >
                      <DeleteIcon fontSize='inherit' />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Paper>
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
            : 'Excluir questão'
        }
        message={
          confirm?.kind === 'assessment'
            ? 'Tem certeza que deseja inativar esta avaliação?'
            : 'Tem certeza que deseja excluir esta questão?'
        }
        onClose={() => setConfirm(null)}
        onConfirm={async () => {
          if (!confirm) return
          try {
            if (confirm.kind === 'assessment') {
              await deleteAssessment.mutateAsync(confirm.id)
            } else {
              await deleteQuestion(confirm.id)
            }
          } catch {
            /* empty */
          } finally {
            setConfirm(null)
          }
        }}
        confirmText={confirm?.kind === 'assessment' ? 'Inativar' : 'Excluir'}
      />
      <Divider sx={{ mt: 2 }} />
    </Paper>
  )
}
