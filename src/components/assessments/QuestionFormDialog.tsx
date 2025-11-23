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
  Stack,
  Tooltip,
  Tabs,
  Tab,
  Typography
} from '@mui/material'
import { Grid } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import {
  type CreateQuestionInput,
  type UpdateQuestionInput,
  type Question
} from '@/api/assessments'

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

// Componente auxiliar para opção de múltipla escolha
const PaperOption = ({
  texto,
  correta,
  onChange,
  onMarkCorrect,
  onRemove
}: {
  texto: string
  correta: boolean
  onChange: (val: string) => void
  onMarkCorrect: () => void
  onRemove: () => void
}) => (
  <>
    <Grid size={{ xs: 21, md: 9 }}>
      <TextField
        label='Opção'
        value={texto}
        onChange={e => onChange(e.target.value)}
        size='small'
        fullWidth
      />
    </Grid>
    <Grid size={{ xs: 2, md: 2 }}>
      <Button
        variant={correta ? 'contained' : 'outlined'}
        color={correta ? 'success' : 'primary'}
        disabled={!texto.trim()}
        onClick={onMarkCorrect}
      >
        {correta ? 'Correta' : 'Marcar'}
      </Button>
    </Grid>
    <Grid size={{ xs: 1, md: 1 }}>
      <Tooltip title='Remover opção'>
        <IconButton onClick={onRemove}>
          <DeleteIcon fontSize='small' />
        </IconButton>
      </Tooltip>
    </Grid>
  </>
)

export default function QuestionFormDialog({
  open,
  onClose,
  onCreate,
  onUpdate,
  mode,
  avaliacaoCodigo,
  question,
  isSubmitting = false
}: QuestionFormDialogProps) {
  const [tipo, setTipo] = useState(TIPO_MULTIPLA)
  const [enunciado, setEnunciado] = useState('')
  const [peso, setPeso] = useState<number | ''>(1)
  const [opcoes, setOpcoes] = useState<Opcao[]>([])
  const [respostaCorreta, setRespostaCorreta] = useState('')
  // Verdadeiro/Falso simplificado - apenas V ou F
  const [respostaVF, setRespostaVF] = useState<'V' | 'F' | ''>('')

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && question) {
        // Carregar dados da questão em edição
        const newOpcoes = (question.opcoes_resposta || []).map((t, idx) => ({
          id: `${idx}`,
          texto: t,
          correta: question.resposta_correta === t
        }))

        setTipo(question.tipo)
        setEnunciado(question.enunciado)
        setPeso(question.peso)
        setOpcoes(newOpcoes)
        setRespostaCorreta(question.resposta_correta || '')
        // Para V/F, extrair a resposta (V ou F)
        if (question.tipo === TIPO_VF && question.resposta_correta) {
          setRespostaVF(
            question.resposta_correta === 'Verdadeiro' ||
              question.resposta_correta === 'V'
              ? 'V'
              : 'F'
          )
        }
      } else {
        // Reset para nova questão
        setTipo(TIPO_MULTIPLA)
        setEnunciado('')
        setPeso(1)
        setOpcoes([])
        setRespostaCorreta('')
        setRespostaVF('')
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
    if (
      respostaCorreta &&
      opcoes.find(o => o.id === id)?.texto === respostaCorreta
    ) {
      setRespostaCorreta('')
    }
  }

  const disableSave =
    !enunciado.trim() ||
    isSubmitting ||
    (tipo === TIPO_MULTIPLA && (opcoes.length < 2 || !respostaCorreta)) ||
    (tipo === TIPO_VF && !respostaVF)

  const handleSubmit = async () => {
    if (disableSave) return
    if (mode === 'create') {
      const payload: CreateQuestionInput = {
        avaliacao_id: avaliacaoCodigo,
        tipo: tipo,
        enunciado: enunciado.trim(),
        peso: peso === '' ? 1 : Number(peso),
        opcoes_resposta:
          tipo === TIPO_MULTIPLA
            ? opcoes.map(o => o.texto.trim())
            : tipo === TIPO_VF
              ? ['Verdadeiro', 'Falso']
              : undefined,
        resposta_correta:
          tipo === TIPO_MULTIPLA
            ? respostaCorreta
            : tipo === TIPO_VF
              ? respostaVF === 'V'
                ? 'Verdadeiro'
                : 'Falso'
              : undefined
      }
      await onCreate(payload)
    } else if (question) {
      const payload: UpdateQuestionInput = {
        tipo: tipo,
        enunciado: enunciado.trim(),
        peso: peso === '' ? 1 : Number(peso),
        opcoes_resposta:
          tipo === TIPO_MULTIPLA
            ? opcoes.map(o => o.texto.trim())
            : tipo === TIPO_VF
              ? ['Verdadeiro', 'Falso']
              : undefined,
        resposta_correta:
          tipo === TIPO_MULTIPLA
            ? respostaCorreta
            : tipo === TIPO_VF
              ? respostaVF === 'V'
                ? 'Verdadeiro'
                : 'Falso'
              : undefined
      }
      await onUpdate(question.id, payload)
    }
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {mode === 'create' ? 'Nova Questão' : 'Editar Questão'}
      </DialogTitle>
      <DialogContent sx={{ py: 0 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 10 }}>
            <Tabs
              value={tipo}
              onChange={(_, newValue) => {
                if (newValue) {
                  setTipo(newValue)
                  // Limpar dados específicos do tipo anterior
                  if (newValue !== TIPO_MULTIPLA) {
                    setOpcoes([])
                    setRespostaCorreta('')
                  }
                  if (newValue !== TIPO_VF) {
                    setRespostaVF('')
                  }
                }
              }}
            >
              <Tab
                value={TIPO_MULTIPLA}
                label='Múltipla Escolha'
                disabled={mode === 'edit' && question?.tipo !== TIPO_MULTIPLA}
              />
              <Tab
                value={TIPO_VF}
                label='V / F'
                disabled={mode === 'edit' && question?.tipo !== TIPO_VF}
              />
              <Tab
                value={TIPO_DISS}
                label='Dissertativa'
                disabled={mode === 'edit' && question?.tipo !== TIPO_DISS}
              />
            </Tabs>
          </Grid>
          <Grid size={{ xs: 2 }}>
            <TextField
              label='Peso'
              variant='standard'
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
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label='Enunciado'
              fullWidth
              multiline
              minRows={3}
              value={enunciado}
              onChange={e => setEnunciado(e.target.value)}
            />
          </Grid>
        </Grid>
        {tipo === TIPO_MULTIPLA && (
          <Box sx={{ mt: 1.5 }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 1 }}
            >
              <Typography variant='h6'>Alternativas</Typography>
              <Button
                startIcon={<AddIcon />}
                variant='text'
                onClick={() => {
                  addOpcao()
                }}
              >
                Adicionar
              </Button>
            </Stack>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {opcoes.map(o => (
                <PaperOption
                  key={o.id}
                  texto={o.texto}
                  correta={respostaCorreta === o.texto.trim()}
                  onChange={val => updateOpcao(o.id, val)}
                  onMarkCorrect={() =>
                    o.texto.trim() && setRespostaCorreta(o.texto.trim())
                  }
                  onRemove={() => removeOpcao(o.id)}
                />
              ))}
            </Grid>
            {opcoes.length === 0 && (
              <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
                Nenhuma alternativa adicionada.
              </Box>
            )}
          </Box>
        )}
        {tipo === TIPO_VF && (
          <Box sx={{ mt: 2 }}>
            <Typography variant='subtitle2' sx={{ mb: 1.5 }}>
              Resposta Correta
            </Typography>
            <ToggleButtonGroup
              fullWidth
              exclusive
              value={respostaVF}
              onChange={(_, v) => v && setRespostaVF(v)}
              color='primary'
            >
              <ToggleButton value='V' color='success'>
                Verdadeiro
              </ToggleButton>
              <ToggleButton value='F' color='error'>
                Falso
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}
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
