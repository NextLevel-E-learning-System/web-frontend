import { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  Paper,
  Stack,
  Chip,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { Quiz } from '@mui/icons-material'
import ListAltIcon from '@mui/icons-material/ListAlt'
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
import AssessmentFormDialog from './AssessmentFormDialog'
import QuestionFormDialog from './QuestionFormDialog'

interface Props {
  open: boolean
  onClose: () => void
  cursoCodigo: string
  cursoTitulo?: string
}

export default function CourseAssessmentsDrawer({
  open,
  onClose,
  cursoCodigo,
  cursoTitulo,
}: Props) {
  const { data: assessments = [], isLoading } = useAssessments({
    curso_id: cursoCodigo,
  })
  const createAssessment = useCreateAssessment()
  const updateAssessment = useUpdateAssessment('') // será sobrescrito ao usar
  const deleteAssessment = useDeleteAssessment()

  const [assessmentDialog, setAssessmentDialog] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    codigo?: string
  }>({ open: false, mode: 'create' })
  const [questionDialog, setQuestionDialog] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    assessmentCodigo?: string
    questionId?: string
  }>({ open: false, mode: 'create' })
  const [selectedAssessmentCodigo, setSelectedAssessmentCodigo] = useState<
    string | null
  >(null)

  const questionsQuery = useAssessmentQuestions(
    selectedAssessmentCodigo || '',
    { enabled: !!selectedAssessmentCodigo }
  ) as any

  // Handlers Assessment
  const handleOpenCreateAssessment = () =>
    setAssessmentDialog({ open: true, mode: 'create' })
  const handleOpenEditAssessment = (codigo: string) =>
    setAssessmentDialog({ open: true, mode: 'edit', codigo })

  const currentAssessment = assessments.find(
    a => a.codigo === assessmentDialog.codigo
  )

  // Handlers Questions
  const handleOpenQuestions = (codigo: string) => {
    setSelectedAssessmentCodigo(codigo)
  }

  const handleCloseQuestions = () => setSelectedAssessmentCodigo(null)

  const handleOpenCreateQuestion = () =>
    setQuestionDialog({
      open: true,
      mode: 'create',
      assessmentCodigo: selectedAssessmentCodigo || undefined,
    })
  const handleOpenEditQuestion = (id: string) =>
    setQuestionDialog({
      open: true,
      mode: 'edit',
      assessmentCodigo: selectedAssessmentCodigo || undefined,
      questionId: id,
    })

  const { mutateAsync: createQuestion } = useCreateQuestion(
    selectedAssessmentCodigo || ''
  )
  const { mutateAsync: updateQuestion } = useUpdateQuestion(
    selectedAssessmentCodigo || '',
    questionDialog.questionId || ''
  )
  const { mutateAsync: deleteQuestion } = useDeleteQuestion(
    selectedAssessmentCodigo || ''
  )

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', md: 900 } } }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        <Box>
          <Typography variant='h6' fontWeight={700}>
            Avaliações do Curso
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {cursoTitulo || cursoCodigo}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<AddIcon />}
            variant='contained'
            onClick={handleOpenCreateAssessment}
          >
            Nova Avaliação
          </Button>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <Box
        sx={{
          p: 2,
          display: 'grid',
          gap: 2,
          overflowY: 'auto',
          height: '100%',
        }}
      >
        <Paper variant='outlined' sx={{ p: 2 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{ mb: 1 }}
          >
            <Typography variant='subtitle2'>Avaliações</Typography>
          </Stack>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : assessments.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              Nenhuma avaliação cadastrada.
            </Typography>
          ) : (
            <List sx={{ display: 'grid', gap: 1 }}>
              {assessments.map(a => (
                <Paper key={a.codigo} variant='outlined' sx={{ p: 1.5 }}>
                  <ListItem disableGutters>
                    <ListItemText
                      primary={
                        <Stack direction='row' alignItems='center' gap={1}>
                          <Quiz fontSize='small' />
                          <Typography fontWeight={600}>{a.titulo}</Typography>
                          {!a.ativo && <Chip size='small' label='Inativa' />}
                        </Stack>
                      }
                      secondary={
                        <Typography variant='caption' color='text.secondary'>
                          Código: {a.codigo} · Nota mínima:{' '}
                          {a.nota_minima ?? '-'} · Tempo:{' '}
                          {a.tempo_limite ?? '-'} min
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title='Gerenciar questões'>
                        <IconButton
                          size='small'
                          onClick={() => handleOpenQuestions(a.codigo)}
                        >
                          <ListAltIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Editar'>
                        <IconButton
                          size='small'
                          onClick={() => handleOpenEditAssessment(a.codigo)}
                        >
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Excluir'>
                        <IconButton
                          size='small'
                          onClick={async () => {
                            await deleteAssessment.mutateAsync(a.codigo)
                          }}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {selectedAssessmentCodigo === a.codigo && (
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
                        <Typography variant='subtitle2'>Questões</Typography>
                        <Button
                          size='small'
                          startIcon={<AddIcon />}
                          onClick={handleOpenCreateQuestion}
                          variant='outlined'
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
                          <CircularProgress size={22} />
                        </Box>
                      ) : questionsQuery.data?.length === 0 ? (
                        <Typography variant='caption' color='text.secondary'>
                          Nenhuma questão.
                        </Typography>
                      ) : (
                        <Stack gap={1}>
                          {questionsQuery.data.map((q: any) => (
                            <Paper
                              key={q.id}
                              variant='outlined'
                              sx={{
                                p: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography variant='body2' fontWeight={600}>
                                  {q.enunciado}
                                </Typography>
                                <Typography
                                  variant='caption'
                                  color='text.secondary'
                                >
                                  Tipo: {q.tipo_questao} · Peso: {q.peso}
                                </Typography>
                              </Box>
                              <Stack direction='row' gap={0.5}>
                                <Tooltip title='Editar'>
                                  <IconButton
                                    size='small'
                                    onClick={() => handleOpenEditQuestion(q.id)}
                                  >
                                    <EditIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title='Remover'>
                                  <IconButton
                                    size='small'
                                    onClick={async () => {
                                      await deleteQuestion(q.id)
                                    }}
                                  >
                                    <DeleteIcon fontSize='inherit' />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                      <Box sx={{ textAlign: 'right', mt: 1 }}>
                        <Button size='small' onClick={handleCloseQuestions}>
                          Fechar
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Paper>
              ))}
            </List>
          )}
        </Paper>
      </Box>

      {/* Dialogs */}
      <AssessmentFormDialog
        open={assessmentDialog.open}
        mode={assessmentDialog.mode}
        cursoId={cursoCodigo}
        assessment={
          assessmentDialog.mode === 'edit' ? currentAssessment : undefined
        }
        onClose={() => setAssessmentDialog({ open: false, mode: 'create' })}
        onCreate={async data => {
          await createAssessment.mutateAsync(data)
        }}
        onUpdate={async (codigo, data) => {
          const updater = useUpdateAssessment(codigo)
          await updater.mutateAsync(data)
        }}
      />

      <QuestionFormDialog
        open={questionDialog.open}
        mode={questionDialog.mode}
        avaliacaoCodigo={questionDialog.assessmentCodigo || ''}
        question={questionsQuery.data?.find(
          (q: any) => q.id === questionDialog.questionId
        )}
        onClose={() => setQuestionDialog({ open: false, mode: 'create' })}
        onCreate={async q => {
          await createQuestion(q)
        }}
        onUpdate={async (_id, data) => {
          await updateQuestion(data)
        }}
      />
    </Drawer>
  )
}
