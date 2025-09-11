import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Close as CloseIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'

interface CursoDetalhes {
  id?: string
  codigo: string
  titulo: string
  descricao?: string
  categoria_nome?: string
  instrutor_nome?: string
  instrutor_id?: string
  duracao_estimada?: number
  xp_oferecido?: number
  nivel_dificuldade?: 'Básico' | 'Intermediário' | 'Avançado'
  ativo?: boolean
  total_modulos?: number
  total_inscritos: number
  total_concluidos: number
  em_andamento: number
  taxa_conclusao: number
  avaliacao_media: number
  total_avaliacoes: number
  tempo_medio_conclusao: number
  data_criacao?: string
}

interface CourseDetailsDialogProps {
  open: boolean
  onClose: () => void
  curso: CursoDetalhes | null
}

export default function CourseDetailsDialog({
  open,
  onClose,
  curso,
}: CourseDetailsDialogProps) {
  if (!curso) return null

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Básico': return 'success'
      case 'Intermediário': return 'warning'
      case 'Avançado': return 'error'
      default: return 'default'
    }
  }

  const getProgressColor = (taxa: number) => {
    if (taxa > 70) return 'success'
    if (taxa > 40) return 'warning'
    return 'error'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SchoolIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {curso.titulo}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  color: 'text.secondary',
                }}
              >
                {curso.codigo}
              </Typography>
            </Box>
          </Box>
          <Button
            onClick={onClose}
            variant="outlined"
            size="small"
            startIcon={<CloseIcon />}
          >
            Fechar
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* Informações Básicas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Informações do Curso
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <AssignmentIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Categoria"
                  secondary={
                    <Chip 
                      variant="outlined" 
                      label={curso.categoria_nome || 'Não definida'} 
                      size="small" 
                    />
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Instrutor"
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Avatar sx={{ width: 20, height: 20, fontSize: '0.75rem' }}>
                        {curso.instrutor_nome?.charAt(0)}
                      </Avatar>
                      {curso.instrutor_nome || 'Não atribuído'}
                    </Box>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ScheduleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Duração Estimada"
                  secondary={`${curso.duracao_estimada || 0} horas`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TrendingUpIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="XP Oferecido"
                  secondary={`${curso.xp_oferecido || 0} pontos`}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StarIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary="Nível de Dificuldade"
                  secondary={
                    <Chip
                      size="small"
                      label={curso.nivel_dificuldade || 'Básico'}
                      color={getNivelColor(curso.nivel_dificuldade || 'Básico') as any}
                    />
                  }
                />
              </ListItem>
            </List>
          </Grid>

          {/* Métricas */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Métricas de Desempenho
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Inscrições e Conclusões
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <GroupIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" fontWeight={600}>
                      {curso.total_inscritos}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Inscritos
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" fontWeight={600}>
                      {curso.total_concluidos}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Concluídos
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Taxa de Conclusão
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={curso.taxa_conclusao}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  color={getProgressColor(curso.taxa_conclusao)}
                />
                <Typography variant="body2" fontWeight={500}>
                  {curso.taxa_conclusao.toFixed(1)}%
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Avaliação dos Alunos
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating
                  value={curso.avaliacao_media}
                  readOnly
                  precision={0.1}
                />
                <Typography variant="body2" fontWeight={500}>
                  {curso.avaliacao_media.toFixed(1)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({curso.total_avaliacoes} avaliações)
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tempo Médio de Conclusão
              </Typography>
              <Typography variant="h6" fontWeight={500}>
                {curso.tempo_medio_conclusao} dias
              </Typography>
            </Box>
          </Grid>

          {/* Descrição */}
          {curso.descricao && (
            <>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Descrição do Curso
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {curso.descricao}
                </Typography>
              </Grid>
            </>
          )}

          {/* Status e Informações Adicionais */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status do Curso
                </Typography>
                <Chip
                  label={curso.ativo ? 'Ativo' : 'Inativo'}
                  color={curso.ativo ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
              {curso.data_criacao && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    Criado em
                  </Typography>
                  <Typography variant="body2">
                    {new Date(curso.data_criacao).toLocaleDateString('pt-BR')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
