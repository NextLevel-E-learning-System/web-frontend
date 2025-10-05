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
  Tabs,
  Tab,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/material'
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

  // Debug: log do estado atual
  console.log('QuestionFormDialog estado:', { tipo, opcoes, afirmacoesVF })

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && question) {
        // Compara antes de atualizar para evitar loops
        const newOpcoes = (question.opcoes_resposta || []).map((t, idx) => ({
          id: `${idx}`,
          texto: t,
          correta: question.resposta_correta === t,
        }))
        const newResposta = question.resposta_correta || ''

        if (
          tipo !== question.tipo_questao ||
          enunciado !== question.enunciado ||
          peso !== question.peso ||
          JSON.stringify(opcoes) !== JSON.stringify(newOpcoes) ||
          respostaCorreta !== newResposta
        ) {
          setTipo(question.tipo_questao)
          setEnunciado(question.enunciado)
          setPeso(question.peso)
          setOpcoes(newOpcoes)
          setRespostaCorreta(newResposta)
        }
      } else {
        // Reset apenas se valores não estão já vazios
        if (
          tipo !== TIPO_MULTIPLA ||
          enunciado !== '' ||
          peso !== 1 ||
          opcoes.length > 0 ||
          respostaCorreta !== '' ||
          afirmacoesVF.length > 0 ||
          usarPesoPorAfirma !== false
        ) {
          setTipo(TIPO_MULTIPLA)
          setEnunciado('')
          setPeso(1)
          setOpcoes([])
          setRespostaCorreta('')
          setAfirmacoesVF([])
          setUsarPesoPorAfirma(false)
        }
      }
    }
  }, [
    open,
    mode,
    question,
    tipo,
    enunciado,
    peso,
    opcoes,
    respostaCorreta,
    afirmacoesVF,
    usarPesoPorAfirma,
  ])

  // Helpers
  const addOpcao = () => {
    console.log('Adicionando nova opção...')
    const newOpcao = { id: crypto.randomUUID(), texto: '' }
    setOpcoes(prev => {
      const updated = [...prev, newOpcao]
      console.log('Opções atualizadas:', updated)
      return updated
    })
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        {mode === 'create' ? 'Nova Questão' : 'Editar Questão'}
      </DialogTitle>
      <DialogContent sx={{ py: 0 }}>
        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 10 }}>
              <Tabs
                value={tipo}
                onChange={(_, v) => {
                  console.log('Mudando tipo de questão para:', v)
                  if (v) setTipo(v)
                }}
              >
                <Tab value={TIPO_MULTIPLA} label='Múltipla Escolha' />
                <Tab value={TIPO_VF} label='V / F' />
                <Tab value={TIPO_DISS} label='Dissertativa' />
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
        </Box>
        {tipo === TIPO_MULTIPLA && (
          <Box sx={{ mt: 1.5 }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 1 }}
            >
              <Typography variant='h6'>Alternativas</Typography>
              <Button startIcon={<AddIcon />} variant='text' onClick={addOpcao}>
                Adicionar
              </Button>
            </Stack>
            <Stack spacing={1}>
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
            </Stack>
            {opcoes.length === 0 && (
              <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
                Nenhuma alternativa adicionada.
              </Box>
            )}
          </Box>
        )}
        {tipo === TIPO_VF && (
          <Box sx={{ mt: 1.5, display: 'grid', gap: 1 }}>
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
            <Stack spacing={1}>
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
            </Stack>
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
