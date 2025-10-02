import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Stack,
  IconButton,
  Typography,
  Chip,
  Box,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { type CreateModuleInput, convertFileToBase64, useUploadMaterial } from '@/api/courses'
import { useCreateAssessment, useCreateQuestion } from '@/api/assessments'

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

export default function ModuleCreateDialog({
  open,
  onClose,
  onCreate,
  nextOrder,
  loading = false,
}: Props) {
  const [titulo, setTitulo] = useState('')
  const [ordem, setOrdem] = useState<number>(nextOrder)
  const [xp, setXp] = useState<number>(0)
  const [obrigatorio, setObrigatorio] = useState(true)
  const [tipoConteudo, setTipoConteudo] = useState('texto')
  const [createdModuleId, setCreatedModuleId] = useState<string | null>(null)
  const [creatingEarly, setCreatingEarly] = useState(false)
  const [conteudo, setConteudo] = useState('')
  const [materials, setMaterials] = useState<PendingMaterial[]>([])
  const [quizCodigo, setQuizCodigo] = useState('')
  const [quizTitulo, setQuizTitulo] = useState('')
  const [quizTempo, setQuizTempo] = useState<number | ''>('')
  const [quizTentativas, setQuizTentativas] = useState<number | ''>('')
  const [quizNotaMin, setQuizNotaMin] = useState<number | ''>('')
  const [questions, setQuestions] = useState<PendingQuizQuestion[]>([])

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
  }, [
    tipoConteudo,
    createdModuleId,
    creatingEarly,
    buildModulePayload,
    onCreate,
  ])

  // Hooks para pipeline (lazy instantiation quando necessário)
  const uploadMaterialMutation = useUploadMaterial(createdModuleId || '')
  const createAssessment = useCreateAssessment()
  // Função que executa pipeline pós criação (somente se módulo já está criado)
  const runPipelineIfNeeded = async () => {
    // Materiais
    if (createdModuleId && (tipoConteudo === 'video' || tipoConteudo === 'pdf') && materials.length) {
      for (const m of materials) {
        try {
          await uploadMaterialMutation.mutateAsync({ nome_arquivo: m.nome_arquivo, base64: m.base64 })
        } catch {}
      }
    }
    // Quiz
    if (createdModuleId && tipoConteudo === 'quiz' && quizCodigo && quizTitulo) {
      try {
        const assessment = await createAssessment.mutateAsync({
          codigo: quizCodigo,
          curso_id: '', // backend pode inferir? se necessário, passar curso (não temos aqui)
          modulo_id: createdModuleId,
          titulo: quizTitulo,
          tempo_limite: quizTempo === '' ? undefined : Number(quizTempo),
          tentativas_permitidas: quizTentativas === '' ? undefined : Number(quizTentativas),
          nota_minima: quizNotaMin === '' ? undefined : Number(quizNotaMin),
        })
        // Criar questões
        if (assessment?.codigo) {
          for (const q of questions) {
            const cq = useCreateQuestion(assessment.codigo)
            try {
              await cq.mutateAsync({
                avaliacao_id: assessment.codigo,
                tipo_questao: q.tipo_questao,
                enunciado: q.enunciado,
                opcoes_resposta: q.opcoes_resposta,
                resposta_correta: q.resposta_correta,
                peso: q.peso,
              })
            } catch {}
          }
        }
      } catch {}
    }
  }

  const handleSubmit = async () => {
    // Texto: criar agora e finalizar
    if (!['video', 'pdf', 'quiz'].includes(tipoConteudo)) {
      if (!createdModuleId) {
        const modulePayload = buildModulePayload()
        if (!modulePayload) return
        await onCreate({ module: modulePayload })
      }
      onClose()
      return
    }
    await runPipelineIfNeeded()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth='sm'
      fullWidth
    >
      <DialogTitle>Novo Módulo</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <TextField
              label='Título'
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              fullWidth
              required
              size='small'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              label='Ordem'
              type='number'
              value={ordem}
              onChange={e => setOrdem(Number(e.target.value) || 1)}
              fullWidth
              size='small'
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
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
                disabled={creatingEarly || !!createdModuleId}
              >
                <MenuItem value='texto'>Texto</MenuItem>
                <MenuItem value='video'>Vídeo</MenuItem>
                <MenuItem value='pdf'>PDF</MenuItem>
                <MenuItem value='quiz'>Quiz</MenuItem>
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
              label='Conteúdo / Descrição'
              value={conteudo}
              onChange={e => setConteudo(e.target.value)}
              placeholder={
                tipoConteudo === 'video' || tipoConteudo === 'pdf'
                  ? 'Descrição do material ou observações'
                  : 'Texto, instruções ou URL'
              }
              multiline
              minRows={3}
              fullWidth
              size='small'
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button variant='outlined' onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={loading || !titulo.trim() || creatingEarly}
        >
          {['video', 'pdf', 'quiz'].includes(tipoConteudo)
            ? createdModuleId
              ? 'Concluir'
              : 'Salvando...'
            : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
