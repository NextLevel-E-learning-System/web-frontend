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
  Stack,
  Tooltip,
  FormControlLabel,
  Switch,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import {
  type CreateQuestionInput,
  type UpdateQuestionInput,
  type Question,
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
interface AfirmaVF {
  id: string
  texto: string
  valor?: 'V' | 'F'
}

// Componente auxiliar para opção de múltipla escolha
const PaperOption = ({
  texto,
  correta,
  onChange,
  onMarkCorrect,
  onRemove,
}: {
  texto: string
  correta: boolean
  onChange: (val: string) => void
  onMarkCorrect: () => void
  onRemove: () => void
}) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
    <TextField
      size='small'
      label='Opção'
      value={texto}
      onChange={e => onChange(e.target.value)}
      sx={{ flex: 1 }}
    />
    <Button
      variant={correta ? 'contained' : 'outlined'}
      color={correta ? 'success' : 'primary'}
      disabled={!texto.trim()}
      onClick={onMarkCorrect}
    >
      {correta ? 'Correta' : 'Marcar'}
    </Button>
    <Tooltip title='Remover opção'>
      <IconButton onClick={onRemove}>
        <DeleteIcon fontSize='small' />
      </IconButton>
    </Tooltip>
  </Box>
)

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
  // Verdadeiro/Falso com múltiplas afirmações
  const [afirmacoesVF, setAfirmacoesVF] = useState<AfirmaVF[]>([])
  const [usarPesoPorAfirma, setUsarPesoPorAfirma] = useState(false)

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
        setAfirmacoesVF([])
        setUsarPesoPorAfirma(false)
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
    (tipo === TIPO_VF &&
      (afirmacoesVF.length === 0 ||
        afirmacoesVF.some(a => !a.texto.trim() || !a.valor)))

  const handleSubmit = async () => {
    if (disableSave) return
    if (mode === 'create') {
      const payload: CreateQuestionInput = {
        avaliacao_id: avaliacaoCodigo,
        tipo_questao: tipo,
        enunciado: enunciado.trim(),
        peso: peso === '' ? 1 : Number(peso),
        opcoes_resposta:
          tipo === TIPO_MULTIPLA
            ? opcoes.map(o => o.texto.trim())
            : tipo === TIPO_VF
              ? afirmacoesVF.map(a => `${a.texto.trim()}::${a.valor}`)
              : undefined,
        resposta_correta:
          tipo === TIPO_MULTIPLA
            ? respostaCorreta
            : tipo === TIPO_VF
              ? afirmacoesVF.map(a => a.valor).join(',')
              : undefined,
      }
      await onCreate(payload)
    } else if (question) {
      const payload: UpdateQuestionInput = {
        tipo_questao: tipo,
        enunciado: enunciado.trim(),
        peso: peso === '' ? 1 : Number(peso),
        opcoes_resposta:
          tipo === TIPO_MULTIPLA
            ? opcoes.map(o => o.texto.trim())
            : tipo === TIPO_VF
              ? afirmacoesVF.map(a => `${a.texto.trim()}::${a.valor}`)
              : undefined,
        resposta_correta:
          tipo === TIPO_MULTIPLA
            ? respostaCorreta
            : tipo === TIPO_VF
              ? afirmacoesVF.map(a => a.valor).join(',')
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
            <Stack direction='row' alignItems='center' gap={1}>
              <Chip label='Alternativas' size='small' color='primary' />
              <Button
                startIcon={<AddIcon />}
                size='small'
                variant='outlined'
                onClick={addOpcao}
              >
                Adicionar
              </Button>
            </Stack>
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
            {opcoes.length === 0 && (
              <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
                Nenhuma opção adicionada.
              </Box>
            )}
          </Box>
        )}
        {tipo === TIPO_VF && (
          <Box sx={{ display: 'grid', gap: 1 }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
            >
              <Chip label='Afirmações V / F' size='small' color='primary' />
              <Button
                size='small'
                variant='outlined'
                startIcon={<AddIcon />}
                onClick={() =>
                  setAfirmacoesVF(a => [
                    ...a,
                    { id: crypto.randomUUID(), texto: '', valor: undefined },
                  ])
                }
              >
                Adicionar Afirmação
              </Button>
            </Stack>
            {afirmacoesVF.map(a => (
              <Box
                key={a.id}
                sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
              >
                <TextField
                  size='small'
                  label='Afirmação'
                  value={a.texto}
                  onChange={e =>
                    setAfirmacoesVF(prev =>
                      prev.map(x =>
                        x.id === a.id ? { ...x, texto: e.target.value } : x
                      )
                    )
                  }
                  sx={{ flex: 1 }}
                />
                <ToggleButtonGroup
                  size='small'
                  exclusive
                  value={a.valor || null}
                  onChange={(_, v) =>
                    v &&
                    setAfirmacoesVF(prev =>
                      prev.map(x => (x.id === a.id ? { ...x, valor: v } : x))
                    )
                  }
                >
                  <ToggleButton value='V'>V</ToggleButton>
                  <ToggleButton value='F'>F</ToggleButton>
                </ToggleButtonGroup>
                <Tooltip title='Remover afirmação'>
                  <IconButton
                    onClick={() =>
                      setAfirmacoesVF(prev => prev.filter(x => x.id !== a.id))
                    }
                  >
                    <DeleteIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}
            {afirmacoesVF.length === 0 && (
              <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
                Nenhuma afirmação adicionada.
              </Box>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={usarPesoPorAfirma}
                  onChange={e => setUsarPesoPorAfirma(e.target.checked)}
                />
              }
              label='Usar peso único (desmarque para manter peso por questão)'
            />
            {!usarPesoPorAfirma && (
              <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
                Peso total da questão aplicado igualmente a cada afirmação
                (cálculo backend futuro).
              </Box>
            )}
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
