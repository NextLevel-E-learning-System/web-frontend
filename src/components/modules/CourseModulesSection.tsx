import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Chip, IconButton, Tooltip, Tabs, Tab } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteIcon from '@mui/icons-material/Delete'
import { useCourseModules, useCreateModule, useUpdateModule } from '@/api/courses'
import ModuleInfoForm from './ModuleInfoForm'
import ModuleMaterialsPanel from './ModuleMaterialsPanel'
import ModuleAssessmentsPanel from '../assessments/ModuleAssessmentsPanel'
import ConfirmationDialog from '../common/ConfirmationDialog'
import ModuleCreateDialog, { type CompositeModuleCreate } from './ModuleCreateDialog'

interface Props {
  cursoCodigo: string
  onTotalXpChange?: (total: number) => void
}

export default function CourseModulesSection({ cursoCodigo, onTotalXpChange }: Props) {
  const { data: modulos = [], isLoading } = useCourseModules(cursoCodigo)
  const createModule = useCreateModule(cursoCodigo)
  const [createOpen, setCreateOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | false>(false)
  const [moduleTab, setModuleTab] = useState<Record<string, string>>({})
  const [confirm, setConfirm] = useState<{ open: boolean; moduloId?: string }>({ open: false })

  useEffect(() => {
    if (onTotalXpChange) {
      const total = modulos.reduce((acc, m: any) => acc + (m.xp || 0), 0)
      onTotalXpChange(total)
    }
  }, [modulos, onTotalXpChange])

  const swapOrder = async (fromId: string, direction: 'up' | 'down') => {
    const ordered = [...modulos].sort((a, b) => a.ordem - b.ordem)
    const idx = ordered.findIndex(m => m.id === fromId)
    if (idx === -1) return
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= ordered.length) return
    const current = ordered[idx]
    const target = ordered[targetIdx]
    const currentOrder = current.ordem
    current.ordem = target.ordem
    target.ordem = currentOrder
    try {
      const updaterCurrent = useUpdateModule(cursoCodigo, current.id)
      const updaterTarget = useUpdateModule(cursoCodigo, target.id)
      await Promise.all([
        updaterCurrent.mutateAsync({ ordem: current.ordem }),
        updaterTarget.mutateAsync({ ordem: target.ordem }),
      ])
    } catch {}
  }

  return (
    <Box>
      <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1 }}>
        <Typography variant='subtitle2'>Módulos</Typography>
        <Button variant='outlined' size='small' startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>Novo Módulo</Button>
      </Stack>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}><CircularProgress size={22} /></Box>
      ) : modulos.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>Nenhum módulo cadastrado.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {modulos.sort((a, b) => a.ordem - b.ordem).map((m, i, arr) => {
            const allowedTabs: Array<'info' | 'materiais' | 'avaliacoes'> = ['info']
            if (['video', 'pdf'].includes((m as any).tipo_conteudo)) allowedTabs.push('materiais')
            if ((m as any).tipo_conteudo === 'quiz') allowedTabs.push('avaliacoes')
            const stored = moduleTab[m.id]
            const currentTab = (stored && allowedTabs.includes(stored as any) ? stored : 'info') as 'info' | 'materiais' | 'avaliacoes'
            return (
              <Accordion key={m.id} expanded={expanded === m.id} onChange={(_, isExp) => setExpanded(isExp ? m.id : false)} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ '& .MuiAccordionSummary-content': { alignItems: 'center', gap: 1 } }}>
                  <Typography variant='body2' fontWeight={600}>{m.titulo}</Typography>
                  <Chip size='small' label={`Ordem ${m.ordem}`} />
                  {m.xp ? <Chip size='small' variant='outlined' label={`${m.xp} XP`} /> : null}
                  {/* Substitui Stack direto por Box para impedir propagação de semântica de botão dentro do botão do AccordionSummary */}
                  <Box component='span' sx={{ display:'flex', flexDirection:'row', gap: 0.5, ml: 'auto' }}>
                    <Tooltip title='Mover para cima'>
                      <span>
                        <IconButton size='small' disabled={i === 0} onClick={e => { e.stopPropagation(); swapOrder(m.id, 'up') }}>
                          <ArrowUpwardIcon fontSize='inherit' />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title='Mover para baixo'>
                      <span>
                        <IconButton size='small' disabled={i === arr.length - 1} onClick={e => { e.stopPropagation(); swapOrder(m.id, 'down') }}>
                          <ArrowDownwardIcon fontSize='inherit' />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title='Excluir módulo (não implementado)'>
                      <span>
                        <IconButton size='small' disabled onClick={e => { e.stopPropagation(); setConfirm({ open: true, moduloId: m.id }) }}>
                          <DeleteIcon fontSize='inherit' />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ mb: 2, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
                    <Tabs value={currentTab} onChange={(_, val) => setModuleTab(prev => ({ ...prev, [m.id]: val }))} variant='scrollable' scrollButtons='auto'>
                      <Tab value='info' label='Info' />
                      {allowedTabs.includes('materiais') && <Tab value='materiais' label='Materiais' />}
                      {allowedTabs.includes('avaliacoes') && <Tab value='avaliacoes' label='Avaliações' />}
                    </Tabs>
                  </Box>
                  {currentTab === 'info' && <ModuleInfoForm cursoCodigo={cursoCodigo} modulo={m} />}
                  {currentTab === 'materiais' && allowedTabs.includes('materiais') && <ModuleMaterialsPanel moduloId={m.id} />}
                  {currentTab === 'avaliacoes' && allowedTabs.includes('avaliacoes') && (
                    <ModuleAssessmentsPanel cursoCodigo={cursoCodigo} moduloId={m.id} moduloTitulo={m.titulo} />
                  )}
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      )}
      <ConfirmationDialog open={confirm.open} title='Excluir módulo' message='Funcionalidade de exclusão ainda não implementada.' onConfirm={() => setConfirm({ open: false })} onClose={() => setConfirm({ open: false })} confirmText='Fechar' cancelText='' />
      <ModuleCreateDialog open={createOpen} onClose={() => setCreateOpen(false)} nextOrder={(modulos?.length || 0) + 1} loading={createModule.isPending} onCreate={async (data: CompositeModuleCreate) => {
        const created = await createModule.mutateAsync(data.module)
        return created
      }} />
    </Box>
  )
}
