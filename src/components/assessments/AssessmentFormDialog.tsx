import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Button
} from '@mui/material'
import {
  type CreateAssessmentInput,
  type UpdateAssessmentInput
} from '@/api/assessments'

export interface AssessmentFormDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateAssessmentInput) => Promise<unknown> | void
  onUpdate: (
    codigo: string,
    data: UpdateAssessmentInput
  ) => Promise<unknown> | void
  mode: 'create' | 'edit'
  cursoId: string
  moduloId?: string
  assessment?: {
    codigo: string
    titulo: string
    tempo_limite?: number
    tentativas_permitidas?: number
    nota_minima?: number
    ativo?: boolean
  } | null
  isSubmitting?: boolean
}

export default function AssessmentFormDialog({
  open,
  onClose,
  onCreate,
  onUpdate,
  mode,
  cursoId,
  moduloId,
  assessment,
  isSubmitting = false
}: AssessmentFormDialogProps) {
  const [codigo, setCodigo] = useState('')
  const [titulo, setTitulo] = useState('')
  const [tempoLimite, setTempoLimite] = useState<number | ''>('')
  const [tentativas, setTentativas] = useState<number | ''>('')
  const [notaMinima, setNotaMinima] = useState<number | ''>('')
  const [ativo, setAtivo] = useState(true)

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && assessment) {
        setCodigo(assessment.codigo)
        setTitulo(assessment.titulo)
        setTempoLimite(assessment.tempo_limite ?? '')
        setTentativas(assessment.tentativas_permitidas ?? '')
        setNotaMinima(assessment.nota_minima ?? '')
        setAtivo(assessment.ativo ?? true)
      } else {
        setCodigo('')
        setTitulo('')
        setTempoLimite('')
        setTentativas('')
        setNotaMinima('')
        setAtivo(true)
      }
    }
  }, [open, mode, assessment])

  const handleSubmit = async () => {
    if (!titulo.trim()) return
    if (mode === 'create') {
      if (!codigo.trim()) return
      const payload: CreateAssessmentInput = {
        codigo: codigo.trim(),
        curso_id: cursoId,
        modulo_id: moduloId,
        titulo: titulo.trim(),
        tempo_limite: tempoLimite === '' ? undefined : Number(tempoLimite),
        tentativas_permitidas:
          tentativas === '' ? undefined : Number(tentativas),
        nota_minima: notaMinima === '' ? undefined : Number(notaMinima)
      }
      await onCreate(payload)
    } else if (assessment) {
      const payload: UpdateAssessmentInput = {
        titulo: titulo.trim(),
        tempo_limite: tempoLimite === '' ? undefined : Number(tempoLimite),
        tentativas_permitidas:
          tentativas === '' ? undefined : Number(tentativas),
        nota_minima: notaMinima === '' ? undefined : Number(notaMinima),
        ativo,
        modulo_id: moduloId
      }
      await onUpdate(assessment.codigo, payload)
    }
    onClose()
  }

  const disableSave =
    !titulo.trim() || (mode === 'create' && !codigo.trim()) || isSubmitting

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {mode === 'create' ? 'Nova Avaliação' : 'Editar Avaliação'}
      </DialogTitle>
      <DialogContent sx={{ py: 0 }}>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              label='Código'
              value={codigo}
              onChange={e => setCodigo(e.target.value)}
              fullWidth
              required
              disabled={mode === 'edit'}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <TextField
              label='Título'
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              fullWidth
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label='Tempo Limite (min)'
              type='number'
              value={tempoLimite}
              onChange={e =>
                setTempoLimite(
                  e.target.value === ''
                    ? ''
                    : Math.max(1, Number(e.target.value) || 1)
                )
              }
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label='Tentativas'
              type='number'
              value={tentativas}
              onChange={e =>
                setTentativas(
                  e.target.value === ''
                    ? ''
                    : Math.max(1, Number(e.target.value) || 1)
                )
              }
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label='Nota Mínima (%)'
              type='number'
              value={notaMinima}
              onChange={e =>
                setNotaMinima(
                  e.target.value === ''
                    ? ''
                    : Math.min(100, Math.max(0, Number(e.target.value) || 0))
                )
              }
              fullWidth
              inputProps={{ min: 0, max: 100 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button variant='outlined' onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={disableSave}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
