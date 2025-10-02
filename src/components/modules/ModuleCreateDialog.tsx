import { useEffect, useState, useCallback, useRef } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, FormControlLabel, Switch, FormControl, InputLabel, Select, MenuItem, Paper, Stack, IconButton, Typography, Chip, Box } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { type CreateModuleInput, convertFileToBase64 } from '@/api/courses'

export interface PendingMaterial {
  nome_arquivo: string
  base64: string
  sizeKB: number
  tipo_arquivo?: string
}

export interface PendingQuizQuestion {
  id: string
  tipo_questao: 'MULTIPLA_ESCOLHA'
  enunciado: string
  opcoes_resposta: string[]
  resposta_correta: string
  peso: number
}

export interface PendingQuizAssessment {
  codigo: string
  titulo: string
  tempo_limite?: number
  tentativas_permitidas?: number
  nota_minima?: number
  questions: PendingQuizQuestion[]
}

export interface CompositeModuleCreate {
  module: CreateModuleInput
  materials?: PendingMaterial[]
  quiz?: PendingQuizAssessment
}

interface Props {
  open: boolean
  onClose: () => void
  onCreate: (data: CompositeModuleCreate) => Promise<unknown> | void
  nextOrder: number
  loading?: boolean
  cursoCodigo?: string
}

export default function ModuleCreateDialog({ open, onClose, onCreate, nextOrder, loading = false }: Props) {
  const [titulo, setTitulo] = useState('')
  const [ordem, setOrdem] = useState<number>(nextOrder)
  const [xp, setXp] = useState<number>(0)
  const [obrigatorio, setObrigatorio] = useState(true)
  const [tipoConteudo, setTipoConteudo] = useState('texto')
  const [createdModuleId, setCreatedModuleId] = useState<string | null>(null)
  const [creatingEarly, setCreatingEarly] = useState(false)
  const [conteudo, setConteudo] = useState('')
  // Materiais (para video/pdf)
  const [materials, setMaterials] = useState<PendingMaterial[]>([])
  // Quiz (para tipo quiz)
  const [quizCodigo, setQuizCodigo] = useState('')
  const [quizTitulo, setQuizTitulo] = useState('')
  const [quizTempo, setQuizTempo] = useState<number | ''>('')
  const [quizTentativas, setQuizTentativas] = useState<number | ''>('')
  const [quizNotaMin, setQuizNotaMin] = useState<number | ''>('')
  const [questions, setQuestions] = useState<PendingQuizQuestion[]>([])
  const [newQEnunciado, setNewQEnunciado] = useState('')
  const [newQOptions, setNewQOptions] = useState<string[]>([''])
  const [newQCorrect, setNewQCorrect] = useState('')
  const [newQPeso, setNewQPeso] = useState<number | ''>('')

  const openedRef = useRef(false)
  const resetState = () => {
    setTitulo('')
    setOrdem(nextOrder)
    setXp(0)
    setObrigatorio(true)
    setTipoConteudo('texto')
    setConteudo('')
    setMaterials([])
    setQuizCodigo('')
    setQuizTitulo('')
    setQuizTempo('')
    setQuizTentativas('')
    setQuizNotaMin('')
    setQuestions([])
    setNewQEnunciado('')
    setNewQOptions([''])
    setNewQCorrect('')
    setNewQPeso('')
    setCreatedModuleId(null)
    setCreatingEarly(false)
  }
  // Reset apenas na abertura inicial
  useEffect(() => {
    if (open && !openedRef.current) {
      resetState()
      openedRef.current = true
    }
    if (!open && openedRef.current) {
      openedRef.current = false
    }
  }, [open])
  // Atualiza ordem sugerida se ainda não criou módulo (não limpar resto)
  useEffect(() => {
    if (open && !createdModuleId) {
      setOrdem(nextOrder)
    }
  }, [nextOrder, open, createdModuleId])

  const buildModulePayload = useCallback((): CreateModuleInput | null => {
    if (!titulo.trim()) return null
    return {
      titulo: titulo.trim(),
      ordem,
      xp,
      obrigatorio,
      tipo_conteudo: tipoConteudo,
      conteudo: conteudo.trim() || undefined,
    }
  }, [titulo, ordem, xp, obrigatorio, tipoConteudo, conteudo])

  // Salvamento antecipado quando tipo de conteúdo exige subseções
  useEffect(() => {
    const needsEarly = ['video', 'pdf', 'quiz'].includes(tipoConteudo)
    if (needsEarly && !createdModuleId && !creatingEarly) {
      const payload = buildModulePayload()
      if (!payload) return // aguardar título
      setCreatingEarly(true)
      // Chama onCreate apenas com módulo base
      Promise.resolve(onCreate({ module: payload }))
        .then((result: any) => {
          // Se callback retornar módulo, capturar id; senão confiar em invalidation (id desconhecido)
          if (result && typeof result === 'object') {
            const maybeId = (result as any).id
            if (maybeId) setCreatedModuleId(maybeId)
          }
          // Caso não retorne, ainda marcamos como criado (id null) apenas para liberar UI
          setCreatedModuleId(prev => prev || 'created')
        })
        .finally(() => setCreatingEarly(false))
    }
  }, [tipoConteudo, createdModuleId, creatingEarly, buildModulePayload, onCreate])

  const handleSubmit = async () => {
    // Caso conteúdo texto: criar agora.
    // Caso outros: se já criou antecipadamente, apenas fechar (pipeline futuro para materiais/quiz será separado)
    if (['video','pdf','quiz'].includes(tipoConteudo)) {
      onClose()
      return
    }
    if (!createdModuleId) {
      const modulePayload = buildModulePayload()
      if (!modulePayload) return
      await onCreate({ module: modulePayload })
    }
    onClose()
  }


  const addMaterial = async (file: File) => {
    const base64 = await convertFileToBase64(file)
    setMaterials(prev => [...prev, { nome_arquivo: file.name, base64, sizeKB: Math.round(file.size / 1024), tipo_arquivo: file.type }])
  }

  const addQuestion = () => {
    if (!newQEnunciado.trim() || !newQCorrect.trim()) return
    const opts = newQOptions.filter(o => o.trim())
    if (!opts.includes(newQCorrect)) return
    setQuestions(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        tipo_questao: 'MULTIPLA_ESCOLHA',
        enunciado: newQEnunciado.trim(),
        opcoes_resposta: opts,
        resposta_correta: newQCorrect,
        peso: newQPeso === '' ? 1 : Number(newQPeso) || 1,
      },
    ])
    setNewQEnunciado('')
    setNewQOptions([''])
    setNewQCorrect('')
    setNewQPeso('')
  }

  const updateOption = (index: number, value: string) => {
    setNewQOptions(opts => opts.map((o, i) => (i === index ? value : o)))
  }
  const addOptionField = () => setNewQOptions(opts => [...opts, ''])

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
              <Select value={tipoConteudo} label='Tipo de Conteúdo' onChange={e => setTipoConteudo(e.target.value)} disabled={creatingEarly || !!createdModuleId}>
                <MenuItem value='texto'>Texto</MenuItem>
                <MenuItem value='video'>Vídeo</MenuItem>
                <MenuItem value='pdf'>PDF</MenuItem>
                <MenuItem value='quiz'>Quiz</MenuItem>
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
              placeholder={tipoConteudo === 'video' || tipoConteudo === 'pdf' ? 'Descrição do material ou observações' : 'Texto, instruções ou URL'}
              multiline
              minRows={3}
              fullWidth
              size='small'
            />
          </Grid>
          {(tipoConteudo === 'video' || tipoConteudo === 'pdf') && createdModuleId && (
            <Grid size={{ xs: 12 }}>
              <Paper variant='outlined' sx={{ p: 2, display: 'grid', gap: 1 }}>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography variant='subtitle2'>Materiais (upload será feito após criar o módulo)</Typography>
                  <Button component='label' size='small' variant='outlined'>Selecionar Arquivo
                    <input hidden type='file' onChange={async e => { const f = e.target.files?.[0]; if (f) { await addMaterial(f); e.target.value = '' } }} />
                  </Button>
                </Stack>
                {materials.length === 0 ? (
                  <Typography variant='caption' color='text.secondary'>Nenhum arquivo selecionado.</Typography>
                ) : (
                  <Stack gap={0.5}>
                    {materials.map(m => (
                      <Paper key={m.nome_arquivo+ m.sizeKB} variant='outlined' sx={{ p: 1, display: 'flex', alignItems:'center', gap:1 }}>
                        <Typography variant='body2' sx={{ flex:1 }}>{m.nome_arquivo}</Typography>
                        <Chip size='small' label={`${m.sizeKB} KB`} />
                        <IconButton size='small' onClick={() => setMaterials(prev => prev.filter(x => x !== m))}><DeleteIcon fontSize='inherit' /></IconButton>
                      </Paper>
                    ))}
                  </Stack>
                )}
                <Typography variant='caption' color='text.secondary'>O módulo já foi salvo. Após fechar, poderá gerenciar materiais completos na aba do módulo.</Typography>
              </Paper>
            </Grid>
          )}
          {tipoConteudo === 'quiz' && createdModuleId && (
            <Grid size={{ xs: 12 }}>
              <Paper variant='outlined' sx={{ p: 2, display:'grid', gap:2 }}>
                <Typography variant='subtitle2'>Avaliação (será criada vinculada a este módulo)</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs:12, md:4 }}>
                    <TextField label='Código do Quiz' value={quizCodigo} onChange={e => setQuizCodigo(e.target.value)} size='small' fullWidth required />
                  </Grid>
                  <Grid size={{ xs:12, md:8 }}>
                    <TextField label='Título do Quiz' value={quizTitulo} onChange={e => setQuizTitulo(e.target.value)} size='small' fullWidth required />
                  </Grid>
                  <Grid size={{ xs:6, md:2 }}>
                    <TextField label='Tempo (min)' type='number' value={quizTempo} onChange={e => setQuizTempo(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)||1))} size='small' fullWidth />
                  </Grid>
                  <Grid size={{ xs:6, md:2 }}>
                    <TextField label='Tentativas' type='number' value={quizTentativas} onChange={e => setQuizTentativas(e.target.value === '' ? '' : Math.max(1, Number(e.target.value)||1))} size='small' fullWidth />
                  </Grid>
                  <Grid size={{ xs:6, md:2 }}>
                    <TextField label='Nota Mín (%)' type='number' value={quizNotaMin} onChange={e => setQuizNotaMin(e.target.value === '' ? '' : Math.min(100, Math.max(0, Number(e.target.value)||0)))} size='small' fullWidth />
                  </Grid>
                </Grid>
                <Box>
                  <Typography variant='subtitle2' sx={{ mb: 1 }}>Questões ({questions.length})</Typography>
                  {questions.map(q => (
                    <Paper key={q.id} variant='outlined' sx={{ p:1, mb:0.5, display:'flex', flexDirection:'column', gap:0.5 }}>
                      <Typography variant='body2' fontWeight={600}>{q.enunciado}</Typography>
                      <Typography variant='caption' color='text.secondary'>Opções: {q.opcoes_resposta.join(', ')} · Correta: {q.resposta_correta} · Peso: {q.peso}</Typography>
                      <Stack direction='row' justifyContent='flex-end'>
                        <IconButton size='small' onClick={() => setQuestions(prev => prev.filter(x => x.id !== q.id))}><DeleteIcon fontSize='inherit' /></IconButton>
                      </Stack>
                    </Paper>
                  ))}
                  <Paper variant='outlined' sx={{ p:1.5, mt:1, display:'grid', gap:1 }}>
                    <TextField label='Enunciado' value={newQEnunciado} onChange={e => setNewQEnunciado(e.target.value)} size='small' fullWidth />
                    <Grid container spacing={1}>
                      {newQOptions.map((opt, idx) => (
                        <Grid key={idx} size={{ xs:12, md:6 }}>
                          <TextField
                            label={`Opção ${idx+1}`}
                            value={opt}
                            onChange={e => updateOption(idx, e.target.value)}
                            size='small'
                            fullWidth
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Stack direction='row' gap={1} flexWrap='wrap'>
                      <Button size='small' startIcon={<AddCircleOutlineIcon />} onClick={addOptionField} variant='outlined'>Adicionar Opção</Button>
                      <TextField label='Correta' value={newQCorrect} onChange={e => setNewQCorrect(e.target.value)} size='small' />
                      <TextField label='Peso' type='number' value={newQPeso} onChange={e => setNewQPeso(e.target.value === '' ? '' : Number(e.target.value)||1)} size='small' sx={{ width:100 }} />
                      <Button size='small' variant='contained' disabled={!newQEnunciado.trim() || !newQCorrect.trim()} onClick={addQuestion}>Adicionar Questão</Button>
                    </Stack>
                  </Paper>
                  <Typography variant='caption' color='text.secondary'>O módulo foi salvo. Estes dados do quiz serão persistidos em etapa futura de pipeline.</Typography>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant='outlined' onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant='contained' onClick={handleSubmit} disabled={loading || !titulo.trim() || creatingEarly}>
          {['video','pdf','quiz'].includes(tipoConteudo) ? (createdModuleId ? 'Concluir' : 'Salvando...') : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
