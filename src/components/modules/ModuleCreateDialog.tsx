import { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
import { type CreateModuleInput } from '@/api/courses'

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateModuleInput) => Promise<unknown> | void
  nextOrder: number
  loading?: boolean
}

export default function ModuleCreateDialog({ open, onClose, onCreate, nextOrder, loading = false }: Props) {
  const [titulo, setTitulo] = useState('')
  const [ordem, setOrdem] = useState<number>(nextOrder)
  const [xp, setXp] = useState<number>(0)
  const [obrigatorio, setObrigatorio] = useState(true)
  const [tipoConteudo, setTipoConteudo] = useState('texto')
  const [conteudo, setConteudo] = useState('')

  useEffect(() => {
    if (open) {
      setTitulo('')
      setOrdem(nextOrder)
      setXp(0)
      setObrigatorio(true)
      setTipoConteudo('texto')
      setConteudo('')
    }
  }, [open, nextOrder])

  const handleSubmit = async () => {
    if (!titulo.trim()) return
    const payload: CreateModuleInput = {
      titulo: titulo.trim(),
      ordem,
      xp,
      obrigatorio,
      tipo_conteudo: tipoConteudo,
      conteudo: conteudo.trim() || undefined,
    }
    await onCreate(payload)
    onClose()
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Novo Módulo</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField label='Título' value={titulo} onChange={e => setTitulo(e.target.value)} fullWidth required size='small' />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }} >
            <TextField label='Ordem' type='number' value={ordem} onChange={e => setOrdem(Number(e.target.value) || 1)} fullWidth size='small' />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField label='XP' type='number' value={xp} onChange={e => setXp(Number(e.target.value) || 0)} fullWidth size='small' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth size='small'>
              <InputLabel>Tipo de Conteúdo</InputLabel>
              <Select value={tipoConteudo} label='Tipo de Conteúdo' onChange={e => setTipoConteudo(e.target.value)}>
                <MenuItem value='texto'>Texto</MenuItem>
                <MenuItem value='video'>Vídeo</MenuItem>
                <MenuItem value='quiz'>Quiz</MenuItem>
                <MenuItem value='pdf'>PDF</MenuItem>
                <MenuItem value='link'>Link</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControlLabel control={<Switch checked={obrigatorio} onChange={e => setObrigatorio(e.target.checked)} />} label={obrigatorio ? 'Obrigatório' : 'Opcional'} />
          </Grid>
          <Grid size={{ xs: 12}}>
            <TextField
              label='Conteúdo / Descrição'
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              placeholder='Texto, instruções ou URL'
              multiline
              minRows={3}
              fullWidth
              size='small'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant='outlined' onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant='contained' onClick={handleSubmit} disabled={loading || !titulo.trim()}>Criar</Button>
      </DialogActions>
    </Dialog>
  )
}
