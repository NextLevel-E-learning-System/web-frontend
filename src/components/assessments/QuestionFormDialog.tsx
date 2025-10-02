import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Box,
  Chip,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import { type CreateQuestionInput, type UpdateQuestionInput, type Question } from '@/api/assessments'

export interface QuestionFormDialogProps {
  open: boolean
  onClose: () => void
  onCreate: (data: CreateQuestionInput) => Promise<unknown> | void
  onUpdate: (id: string, data: UpdateQuestionInput) => Promise<unknown> | void
  mode: 'create' | 'edit'
  avaliacaoCodigo: string
  question?: Question | null
  isSubmitting?: boolean
}

const TIPO_MULTIPLA = 'MULTIPLA_ESCOLHA'
const TIPO_VF = 'VERDADEIRO_FALSO'
const TIPO_DISS = 'DISSERTATIVA'

type Opcao = { id: string; texto: string; correta?: boolean }

export default function QuestionFormDialog({
  open,
  onClose,
  onCreate,
  onUpdate,
  mode,
  avaliacaoCodigo,
  question,
  isSubmitting = false,
}: QuestionFormDialogProps) {
  const [tipo, setTipo] = useState(TIPO_MULTIPLA)
  const [enunciado, setEnunciado] = useState('')
  const [peso, setPeso] = useState<number | ''>(1)
  const [opcoes, setOpcoes] = useState<Opcao[]>([])
  const [respostaCorreta, setRespostaCorreta] = useState('')

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && question) {
        setTipo(question.tipo_questao)
        setEnunciado(question.enunciado)
        setPeso(question.peso)
        setOpcoes(
          (question.opcoes_resposta || []).map((t, idx) => ({
            id: `${idx}`,
            texto: t,
            correta: question.resposta_correta === t,
          }))
        )
        setRespostaCorreta(question.resposta_correta || '')
      } else {
        setTipo(TIPO_MULTIPLA)
        setEnunciado('')
        setPeso(1)
        setOpcoes([])
        setRespostaCorreta('')
      }
    }
  }, [open, mode, question])

  // Helpers
  const addOpcao = () => {
    setOpcoes(prev => [...prev, { id: crypto.randomUUID(), texto: '' }])
  }
  const updateOpcao = (id: string, texto: string) => {
    setOpcoes(prev => prev.map(o => (o.id === id ? { ...o, texto } : o)))
  }
  const removeOpcao = (id: string) => {
    setOpcoes(prev => prev.filter(o => o.id !== id))
    if (respostaCorreta && opcoes.find(o => o.id === id)?.texto === respostaCorreta) {
      setRespostaCorreta('')
    }
  }

  const disableSave =
    !enunciado.trim() ||
    isSubmitting ||
    (tipo === TIPO_MULTIPLA && (opcoes.length < 2 || !respostaCorreta))

  const handleSubmit = async () => {
    if (disableSave) return
    if (mode === 'create') {
      const payload: CreateQuestionInput = {
        avaliacao_id: avaliacaoCodigo,
        tipo_questao: tipo,
        enunciado: enunciado.trim(),
        peso: peso === '' ? 1 : Number(peso),
        opcoes_resposta: tipo === TIPO_MULTIPLA ? opcoes.map(o => o.texto.trim()) : undefined,
        resposta_correta:
          tipo === TIPO_MULTIPLA
            ? respostaCorreta
            : tipo === TIPO_VF
            ? 'VERDADEIRO' // placeholder, backend pode ignorar para VF se tratar diferente
            : undefined,
      }
      await onCreate(payload)
    } else if (question) {
      const payload: UpdateQuestionInput = {
        tipo_questao: tipo,
        enunciado: enunciado.trim(),
        peso: peso === '' ? 1 : Number(peso),
        opcoes_resposta: tipo === TIPO_MULTIPLA ? opcoes.map(o => o.texto.trim()) : undefined,
        resposta_correta:
          tipo === TIPO_MULTIPLA
            ? respostaCorreta
            : tipo === TIPO_VF
            ? 'VERDADEIRO'
            : undefined,
      }
      await onUpdate(question.id, payload)
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='md'>
      <DialogTitle>
        {mode === 'create' ? 'Nova Questão' : 'Editar Questão'}
      </DialogTitle>
      <DialogContent sx={{ pt: 2, display: 'grid', gap: 2 }}>
        <ToggleButtonGroup
          exclusive
          value={tipo}
          onChange={(_, v) => v && setTipo(v)}
          size='small'
        >
          <ToggleButton value={TIPO_MULTIPLA}>Múltipla Escolha</ToggleButton>
          <ToggleButton value={TIPO_VF}>V / F</ToggleButton>
          <ToggleButton value={TIPO_DISS}>Dissertativa</ToggleButton>
        </ToggleButtonGroup>
        <TextField
          label='Enunciado'
          fullWidth
          multiline
          minRows={3}
          value={enunciado}
          onChange={e => setEnunciado(e.target.value)}
        />
        <TextField
          label='Peso'
            type='number'
          value={peso}
          onChange={e =>
            setPeso(
              e.target.value === ''
                ? ''
                : Math.max(1, Number(e.target.value) || 1)
            )
          }
          inputProps={{ min: 1 }}
          sx={{ maxWidth: 180 }}
        />
        {tipo === TIPO_MULTIPLA && (
          <Box sx={{ display: 'grid', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label='Alternativas' size='small' color='primary' />
              <Button
                startIcon={<AddIcon />}
                size='small'
                variant='outlined'
                onClick={addOpcao}
              >
                Adicionar
              </Button>
            </Box>
            {opcoes.map(o => (
              <Box
                key={o.id}
                sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
              >
                <TextField
                  size='small'
                  label='Opção'
                  value={o.texto}
                  onChange={e => updateOpcao(o.id, e.target.value)}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant={
                    respostaCorreta === o.texto.trim() ? 'contained' : 'outlined'
                  }
                  disabled={!o.texto.trim()}
                  onClick={() => setRespostaCorreta(o.texto.trim())}
                >
                  Correta
                </Button>
                <IconButton onClick={() => removeOpcao(o.id)}>
                  <DeleteIcon fontSize='small' />
                </IconButton>
              </Box>
            ))}
            {opcoes.length === 0 && (
              <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
                Nenhuma opção adicionada.
              </Box>
            )}
          </Box>
        )}
        {tipo === TIPO_VF && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label='Verdadeiro / Falso padrão' size='small' />
          </Box>
        )}
        {tipo === TIPO_DISS && (
          <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
            Resposta aberta — será corrigida manualmente.
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={disableSave}
        >
          {mode === 'create' ? 'Criar' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
