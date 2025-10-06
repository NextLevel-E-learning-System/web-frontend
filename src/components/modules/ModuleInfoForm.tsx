import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  Box,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { type Module, useUpdateModule } from '@/api/courses'

interface Props {
  cursoCodigo: string
  modulo: Module
  onSaved?: () => void
}

export default function ModuleInfoForm({
  cursoCodigo,
  modulo,
  onSaved,
}: Props) {
  const [titulo, setTitulo] = useState(modulo.titulo)
  const [ordem, setOrdem] = useState<number>(modulo.ordem)
  const [xp, setXp] = useState<number>(modulo.xp)
  const [obrigatorio, setObrigatorio] = useState<boolean>(modulo.obrigatorio)
  const [conteudo, setConteudo] = useState<string>(modulo.conteudo || '')
  const [tipoConteudo, setTipoConteudo] = useState<string>(
    modulo.tipo_conteudo || 'texto'
  )
  const updateModule = useUpdateModule(cursoCodigo, modulo.id)

  const handleSave = async () => {
    try {
      const response = await updateModule.mutateAsync({
        titulo,
        ordem,
        xp,
        obrigatorio,
        conteudo,
        tipo_conteudo: tipoConteudo,
      })
      if (response?.mensagem) {
        toast.success(response.mensagem)
      }
      onSaved?.()
    } catch {
      toast.error('Erro ao atualizar módulo')
    }
  }
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label='Título'
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            fullWidth
            size='small'
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <TextField
            label='Ordem'
            type='number'
            value={ordem}
            onChange={e => setOrdem(Number(e.target.value) || 1)}
            fullWidth
            size='small'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label='XP'
            type='number'
            value={xp}
            onChange={e => setXp(Number(e.target.value) || 0)}
            fullWidth
            size='small'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth size='small'>
            <InputLabel>Tipo de Conteúdo</InputLabel>
            <Select
              value={tipoConteudo}
              label='Tipo de Conteúdo'
              onChange={e => setTipoConteudo(e.target.value)}
            >
              <MenuItem value='texto'>Texto</MenuItem>
              <MenuItem value='video'>Vídeo</MenuItem>
              <MenuItem value='quiz'>Quiz</MenuItem>
              <MenuItem value='pdf'>PDF</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControlLabel
            control={
              <Switch
                checked={obrigatorio}
                onChange={e => setObrigatorio(e.target.checked)}
              />
            }
            label={obrigatorio ? 'Obrigatório' : 'Opcional'}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label='Conteúdo / Descrição do Módulo'
            value={conteudo}
            onChange={e => setConteudo(e.target.value)}
            fullWidth
            size='small'
            multiline
            minRows={3}
            placeholder='Descrição, instruções ou URL (para vídeo/link)'
          />
        </Grid>
      </Grid>
      <Stack direction='row' justifyContent='flex-end'>
        <Button
          variant='contained'
          size='small'
          onClick={handleSave}
          disabled={updateModule.isPending || !titulo.trim()}
        >
          Salvar
        </Button>
      </Stack>
    </Box>
  )
}
