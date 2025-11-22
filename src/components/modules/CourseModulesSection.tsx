import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  useCourseModules,
  useCreateModule,
  useDeleteModule,
} from '@/api/courses'
import { toast } from 'react-toastify'
import ModuleInfoForm from './ModuleInfoForm'
import ModuleMaterialsPanel from './ModuleMaterialsPanel'
import ModuleAssessmentsPanel from '../assessments/ModuleAssessmentsPanel'
import ConfirmationDialog from '../common/ConfirmationDialog'
import ModuleCreateDialog from './ModuleCreateDialog'

interface Props {
  cursoCodigo: string
  onTotalXpChange?: (total: number) => void
  isViewOnly?: boolean
}

export default function CourseModulesSection({
  cursoCodigo,
  onTotalXpChange,
  isViewOnly = false,
}: Props) {
  const {
    data: modulos = [],
    isLoading,
    refetch: refetchModules,
  } = useCourseModules(cursoCodigo)
  const createModule = useCreateModule(cursoCodigo)
  const deleteModule = useDeleteModule()
  const [createOpen, setCreateOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | false>(false)
  const [moduleTab, setModuleTab] = useState<Record<string, string>>({})
  const [confirm, setConfirm] = useState<{ open: boolean; moduloId?: string }>({
    open: false,
  })

  // Módulos ordenados memoizados (evita recriação constante de objetos)
  const orderedModules = useMemo(
    () => [...modulos].sort((a, b) => a.ordem - b.ordem),
    [modulos]
  )

  useEffect(() => {
    if (onTotalXpChange) {
      const total = modulos.reduce((acc, m) => acc + (m.xp || 0), 0)
      onTotalXpChange(total)
    }
  }, [modulos, onTotalXpChange])

  return (
    <Box>
      {!isViewOnly && (
        <Stack
          direction='row'
          alignItems='center'
          justifyContent='end'
          sx={{ mb: 2 }}
        >
          <Button
            variant='contained'
            size='small'
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
          >
            Novo Módulo
          </Button>
        </Stack>
      )}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={22} />
        </Box>
      ) : modulos.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          Nenhum módulo cadastrado.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {orderedModules.map(m => {
            const allowedTabs: Array<'info' | 'materiais' | 'avaliacoes'> = [
              'info',
            ]
            if (m.tipo_conteudo && ['material'].includes(m.tipo_conteudo))
              allowedTabs.push('materiais')
            if (m.tipo_conteudo === 'quiz') allowedTabs.push('avaliacoes')
            const stored = moduleTab[m.id]
            const currentTab = (
              stored &&
              allowedTabs.includes(
                stored as 'info' | 'materiais' | 'avaliacoes'
              )
                ? stored
                : 'info'
            ) as 'info' | 'materiais' | 'avaliacoes'
            return (
              <Accordion
                key={m.id}
                expanded={expanded === m.id}
                onChange={(_, isExp) => setExpanded(isExp ? m.id : false)}
                disableGutters
                square
                sx={{
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: expanded ? 'primary.main' : 'divider',
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
                    bgcolor: expanded
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
                    {/* Status Icon */}
                    <Box
                      sx={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {m.ordem}
                    </Box>

                    {/* Module Info */}
                    <Stack spacing={0.5} flex={1} minWidth={0}>
                      <Typography variant='subtitle1' fontWeight={700}>
                        {m.titulo}
                      </Typography>
                      {m.conteudo && (
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {m.conteudo}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={m.obrigatorio ? 'Obrigatório' : 'Opcional'}
                          size='small'
                          color={m.obrigatorio ? 'primary' : 'default'}
                          variant='outlined'
                        />
                        <Chip
                          label={`${m.xp} XP`}
                          size='small'
                          color='secondary'
                          variant='outlined'
                        />
                      </Box>
                    </Stack>

                    {/* Action Button */}
                    {!isViewOnly && (
                      <Tooltip title='Excluir módulo'>
                        <IconButton
                          size='small'
                          color='error'
                          onClick={e => {
                            e.stopPropagation()
                            setConfirm({ open: true, moduloId: m.id })
                          }}
                          disabled={deleteModule.isPending}
                        >
                          <DeleteIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
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
                        setModuleTab(prev => ({ ...prev, [m.id]: val }))
                      }
                      scrollButtons='auto'
                    >
                      <Tab value='info' label={`Módulo ${m.ordem}`} />
                      {allowedTabs.includes('materiais') && (
                        <Tab value='materiais' label='Material' />
                      )}
                      {allowedTabs.includes('avaliacoes') && (
                        <Tab value='avaliacoes' label='Avaliação' />
                      )}
                    </Tabs>
                  </Box>
                  {currentTab === 'info' && (
                    <ModuleInfoForm
                      key={m.id}
                      cursoCodigo={cursoCodigo}
                      modulo={m}
                      isViewOnly={isViewOnly}
                    />
                  )}
                  {currentTab === 'materiais' &&
                    allowedTabs.includes('materiais') && (
                    <ModuleMaterialsPanel
                      moduloId={m.id}
                      isViewOnly={isViewOnly}
                    />
                  )}
                  {currentTab === 'avaliacoes' &&
                    allowedTabs.includes('avaliacoes') && (
                    <ModuleAssessmentsPanel
                      cursoCodigo={cursoCodigo}
                      moduloId={m.id}
                      isViewOnly={isViewOnly}
                    />
                  )}
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Stack>
      )}
      <ConfirmationDialog
        open={confirm.open}
        title='Excluir módulo'
        message={
          confirm.moduloId
            ? `Tem certeza que deseja excluir este módulo? Esta ação não pode ser desfeita.`
            : 'Selecione um módulo para excluir.'
        }
        onConfirm={async () => {
          if (confirm.moduloId) {
            try {
              const response = await deleteModule.mutateAsync(confirm.moduloId)
              if (response?.mensagem) {
                toast.success(response.mensagem)
              }
              setConfirm({ open: false })
              refetchModules()
            } catch {
              toast.error('Erro ao deletar módulo')
            }
          }
        }}
        onClose={() => setConfirm({ open: false })}
        confirmText='Excluir'
        cancelText='Cancelar'
      />
      <ModuleCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        nextOrder={(modulos?.length || 0) + 1}
        loading={createModule.isPending}
        onCreate={async data => {
          try {
            const response = await createModule.mutateAsync(data.module)
            if (response?.mensagem) {
              toast.success(response.mensagem)
            }
            refetchModules()
            return response
          } catch {
            toast.error('Erro ao criar módulo')
          }
        }}
      />
    </Box>
  )
}
