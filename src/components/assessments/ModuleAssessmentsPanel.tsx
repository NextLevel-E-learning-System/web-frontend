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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
} from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMore'
import ConfirmationDialog from '@/components/common/ConfirmationDialog'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
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
  isViewOnly?: boolean
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
  isViewOnly = false,
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
  const [expanded, setExpanded] = useState<string | false>(false)
  const [assessmentTab, setAssessmentTab] = useState<Record<string, string>>({})
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
    questionDialog.assessmentCodigo || expanded || ''
  const questionsQuery = useAssessmentQuestions(activeAssessmentForQuestions, {
    enabled:
      !!activeAssessmentForQuestions &&
      expanded === activeAssessmentForQuestions,
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
      {!isViewOnly && (
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
      )}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={26} />
        </Box>
      ) : assessments.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          Nenhuma avaliação neste módulo.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {assessments.map(a => {
            const currentTab = (assessmentTab[a.codigo] || 'info') as
              | 'info'
              | 'questoes'
            return (
              <Accordion
                key={a.codigo}
                expanded={expanded === a.codigo}
                onChange={(_, isExp) => setExpanded(isExp ? a.codigo : false)}
                disableGutters
                square
                sx={{
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor:
                    expanded === a.codigo ? 'primary.main' : 'divider',
                  boxShadow: 'none',
                  overflow: 'hidden',
                  '&:before': {
                    display: 'none',
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreRoundedIcon />}
                  sx={{
                    px: { xs: 2, md: 3 },
                    bgcolor:
                      expanded === a.codigo
                        ? 'rgba(59,130,246,0.07)'
                        : 'background.paper',
                    transition: 'background-color 0.2s ease',
                    '& .MuiAccordionSummary-content': {
                      my: 1.5,
                    },
                  }}
                >
                  <Stack
                    direction='row'
                    spacing={2}
                    alignItems='center'
                    flex={1}
                  >
                    {/* Icon */}
                    <Quiz sx={{ color: 'primary.main', fontSize: 32 }} />

                    {/* Assessment Info */}
                    <Stack spacing={0.5} flex={1} minWidth={0}>
                      <Typography variant='subtitle1' fontWeight={700}>
                        {a.titulo}
                      </Typography>
                    </Stack>

                    {/* Action Buttons */}
                    {!isViewOnly && (
                      <Stack direction='row' gap={0.5}>
                        <Tooltip title='Editar Avaliação'>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              setAssessmentDialog({
                                open: true,
                                mode: 'edit',
                                codigo: a.codigo,
                              })
                            }}
                          >
                            <EditIcon fontSize='small' />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={a.ativo ? 'Inativar' : 'Ativar'}>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              handleToggleAssessmentStatus(a)
                            }}
                          >
                            {a.ativo ? (
                              <DeleteIcon fontSize='small' />
                            ) : (
                              <CheckCircleIcon fontSize='small' />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ px: { xs: 2, md: 3 }, pb: 3, pt: 0 }}>
                  <Divider sx={{ mb: 3 }} />
                  <Box
                    sx={{
                      mb: 2,
                      borderBottom: theme =>
                        `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Tabs
                      value={currentTab}
                      onChange={(_, val) =>
                        setAssessmentTab(prev => ({ ...prev, [a.codigo]: val }))
                      }
                      scrollButtons='auto'
                    >
                      <Tab value='info' label='Informações' />
                      <Tab value='questoes' label='Questões' />
                    </Tabs>
                  </Box>

                  {currentTab === 'info' && (
                    <Box>
                      <Stack gap={1}>
                        <Typography variant='body2' color='text.secondary'>
                          <strong>Status:</strong>{' '}
                          {a.ativo ? 'Ativo' : 'Inativo'}
                        </Typography>
                        {a.nota_minima != null && (
                          <Typography variant='body2' color='text.secondary'>
                            <strong>Nota mínima:</strong> {a.nota_minima}%
                          </Typography>
                        )}
                        {a.tempo_limite && (
                          <Typography variant='body2' color='text.secondary'>
                            <strong>Tempo limite:</strong> {a.tempo_limite} min
                          </Typography>
                        )}
                        {a.tentativas_permitidas && (
                          <Typography variant='body2' color='text.secondary'>
                            <strong>Tentativas permitidas:</strong>{' '}
                            {a.tentativas_permitidas}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  )}

                  {currentTab === 'questoes' && (
                    <Box>
                      {!isViewOnly && (
                        <Stack
                          direction='row'
                          alignItems='center'
                          justifyContent='end'
                          sx={{ mb: 2 }}
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
                            size='small'
                          >
                            Nova questão
                          </Button>
                        </Stack>
                      )}
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
                        <Typography variant='body2' color='text.secondary'>
                          Nenhuma questão cadastrada.
                        </Typography>
                      ) : (
                        <Stack gap={2}>
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
                                    variant='caption'
                                    color='text.secondary'
                                    sx={{ display: 'block', mb: 1 }}
                                  >
                                    Tipo: {formatQuestionType(q.tipo)}
                                    {' - '}
                                    Peso: {q.peso}
                                  </Typography>
                                  <Typography
                                    variant='body2'
                                    fontWeight={500}
                                    sx={{ mb: 0.5 }}
                                  >
                                    {q.enunciado}
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
                                          sx={{ display: 'block', mb: 0.5 }}
                                        >
                                          Resposta correta:
                                        </Typography>
                                        <Chip
                                          size='small'
                                          label={q.resposta_correta}
                                          color={
                                            q.resposta_correta === 'Verdadeiro'
                                              ? 'success'
                                              : 'error'
                                          }
                                          variant='filled'
                                          sx={{
                                            fontWeight: 600,
                                            fontSize: '0.75rem',
                                          }}
                                        />
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

                                {!isViewOnly && (
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
                                )}
                              </Box>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            )
          })}
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
