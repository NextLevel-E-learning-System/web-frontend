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
import  ConfirmationDialog  from '@/components/common/ConfirmationDialog'
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
} from '@/api/assessments'

interface Props {
  cursoCodigo: string
  moduloId: string
  moduloTitulo?: string
}

export default function ModuleAssessmentsPanel({ cursoCodigo, moduloId, moduloTitulo }: Props) {
  const { data: assessments = [], isLoading } = useAssessments({ curso_id: cursoCodigo, modulo_id: moduloId })
  const createAssessment = useCreateAssessment()
  const deleteAssessment = useDeleteAssessment()

  const [assessmentDialog, setAssessmentDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; codigo?: string }>({ open: false, mode: 'create' })
  const [expandedAssessment, setExpandedAssessment] = useState<string | null>(null)
  const [questionDialog, setQuestionDialog] = useState<{ open: boolean; mode: 'create' | 'edit'; assessmentCodigo?: string; questionId?: string }>({ open: false, mode: 'create' })

  // Atualização de avaliação
  const assessmentCodigoBeingEdited = assessmentDialog.mode === 'edit' ? assessmentDialog.codigo : undefined
  const updateAssessmentHook = useUpdateAssessment(assessmentCodigoBeingEdited || '')

  // Questões
  const activeAssessmentForQuestions = questionDialog.assessmentCodigo || expandedAssessment || ''
  const questionsQuery = useAssessmentQuestions(activeAssessmentForQuestions, { enabled: !!activeAssessmentForQuestions && expandedAssessment === activeAssessmentForQuestions })
  const { mutateAsync: createQuestion } = useCreateQuestion(activeAssessmentForQuestions)
  const { mutateAsync: deleteQuestion } = useDeleteQuestion(activeAssessmentForQuestions)
  const updateQuestionHook = useUpdateQuestion(activeAssessmentForQuestions, questionDialog.questionId || '')

  const currentAssessment = useMemo(() => assessments.find(a => a.codigo === assessmentDialog.codigo), [assessments, assessmentDialog.codigo])
  const [confirm, setConfirm] = useState<{ open: boolean; kind: 'assessment' | 'question'; id: string } | null>(null)

  return (
    <Paper variant='outlined' sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='subtitle2'>Avaliações do Módulo {moduloTitulo ? `— ${moduloTitulo}` : ''}</Typography>
        <Button startIcon={<AddIcon />} size='small' onClick={() => setAssessmentDialog({ open: true, mode: 'create' })} variant='outlined'>Nova Avaliação</Button>
      </Stack>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={26} /></Box>
      ) : assessments.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>Nenhuma avaliação neste módulo.</Typography>
      ) : (
        <Stack gap={1}>
          {assessments.map(a => (
            <Paper key={a.codigo} variant='outlined' sx={{ p: 1.5 }}>
              <Stack direction='row' alignItems='flex-start' gap={1}>
                <Quiz fontSize='small' />
                <Box sx={{ flex: 1 }}>
                  <Typography variant='body2' fontWeight={600}>{a.titulo}</Typography>
                  <Typography variant='caption' color='text.secondary'>Código: {a.codigo} · Nota mínima: {a.nota_minima ?? '-'} · Tempo: {a.tempo_limite ?? '-'} min</Typography>
                  <Stack direction='row' gap={1} mt={0.5} flexWrap='wrap'>
                    {!a.ativo && <Chip size='small' label='Inativa' />}
                    {a.tentativas_permitidas && <Chip size='small' variant='outlined' label={`Tentativas ${a.tentativas_permitidas}`} />}
                    {a.nota_minima != null && <Chip size='small' variant='outlined' label={`Nota mínima ${a.nota_minima}%`} />}
                  </Stack>
                  {expandedAssessment === a.codigo && (
                    <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 1, bgcolor: 'background.default', border: theme => `1px dashed ${theme.palette.divider}` }}>
                      <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
                        <Typography variant='subtitle2'>Questões</Typography>
                        <Button size='small' startIcon={<AddIcon />} onClick={() => setQuestionDialog({ open: true, mode: 'create', assessmentCodigo: a.codigo })} variant='outlined'>Nova questão</Button>
                      </Stack>
                      {questionsQuery.isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={20} /></Box>
                      ) : questionsQuery.data?.length === 0 ? (
                        <Typography variant='caption' color='text.secondary'>Nenhuma questão.</Typography>
                      ) : (
                        <Stack gap={1}>
                          {questionsQuery?.data?.map((q: any) => (
                            <Paper key={q.id} variant='outlined' sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant='body2' fontWeight={600}>{q.enunciado}</Typography>
                                <Typography variant='caption' color='text.secondary'>Tipo: {q.tipo_questao} · Peso: {q.peso}</Typography>
                              </Box>
                              <Stack direction='row' gap={0.5}>
                                <Tooltip title='Editar'>
                                  <IconButton size='small' onClick={() => setQuestionDialog({ open: true, mode: 'edit', assessmentCodigo: a.codigo, questionId: q.id })}>
                                    <EditIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Remover'>
                                  <IconButton size='small' onClick={() => setConfirm({ open: true, kind: 'question', id: q.id })}>
                                    <DeleteIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                      <Box sx={{ textAlign: 'right', mt: 1 }}>
                        <Button size='small' onClick={() => setExpandedAssessment(null)}>Fechar</Button>
                      </Box>
                    </Box>
                  )}
                </Box>
                <Stack direction='row' gap={0.5}>
                  <Tooltip title='Questões'>
                    <IconButton size='small' onClick={() => setExpandedAssessment(p => (p === a.codigo ? null : a.codigo))}>
                      <ListAltIcon fontSize='inherit' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Editar'>
                    <IconButton size='small' onClick={() => setAssessmentDialog({ open: true, mode: 'edit', codigo: a.codigo })}>
                      <EditIcon fontSize='inherit' />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title='Excluir'>
                    <IconButton size='small' onClick={() => setConfirm({ open: true, kind: 'assessment', id: a.codigo })}>
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
        assessment={assessmentDialog.mode === 'edit' ? currentAssessment : undefined}
        onClose={() => setAssessmentDialog({ open: false, mode: 'create' })}
        onCreate={async data => { await createAssessment.mutateAsync(data) }}
        onUpdate={async (_codigo, data) => { if (assessmentCodigoBeingEdited) { await updateAssessmentHook.mutateAsync(data) } }}
      />

      <QuestionFormDialog
        open={questionDialog.open}
        mode={questionDialog.mode}
        avaliacaoCodigo={activeAssessmentForQuestions}
        question={questionsQuery.data?.find(q => q.id === questionDialog.questionId)}
        onClose={() => setQuestionDialog({ open: false, mode: 'create' })}
        onCreate={async q => { await createQuestion(q) }}
        onUpdate={async (_id, data) => { if (questionDialog.questionId) { await updateQuestionHook.mutateAsync(data) } }}
      />
      <ConfirmationDialog
        open={!!confirm?.open}
        title={confirm?.kind === 'assessment' ? 'Excluir avaliação' : 'Excluir questão'}
        message={confirm?.kind === 'assessment' ? 'Tem certeza que deseja excluir esta avaliação? Esta ação é irreversível.' : 'Tem certeza que deseja excluir esta questão?'}
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
            } finally {
              setConfirm(null)
            }
        }}
        confirmText='Excluir'
      />
      <Divider sx={{ mt: 2 }} />
    </Paper>
  )
}
