import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  LinearProgress,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Search as SearchIcon,
  FileDownload as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  People as PeopleIcon,
} from '@mui/icons-material'
import { useCourseEnrollments } from '@/api/progress'

interface Props {
  cursoCodigo: string
}

export default function CourseStudentsPanel({ cursoCodigo }: Props) {
  const [searchTerm, setSearchTerm] = useState('')

  // Buscar inscrições do curso
  const { data: response, isLoading } = useCourseEnrollments(cursoCodigo)
  const enrollments = response?.items || []

  const filteredEnrollments = enrollments.filter(e =>
    e.funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: enrollments.length,
    emAndamento: enrollments.filter(e => e.status === 'EM_ANDAMENTO').length,
    concluidos: enrollments.filter(e => e.status === 'CONCLUIDO').length,
    abandonados: enrollments.filter(e => e.status === 'ABANDONADO').length,
    taxaConclusao:
      (enrollments.filter(e => e.status === 'CONCLUIDO').length /
        enrollments.length) *
      100,
    mediaProgresso:
      enrollments.reduce((acc, e) => acc + e.progresso, 0) / enrollments.length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return 'success'
      case 'EM_ANDAMENTO':
        return 'info'
      case 'ABANDONADO':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONCLUIDO':
        return 'Concluído'
      case 'EM_ANDAMENTO':
        return 'Em Andamento'
      case 'ABANDONADO':
        return 'Abandonado'
      default:
        return status
    }
  }

  const handleExportPDF = () => {
    // Implementar exportação PDF
    console.log('Exportar PDF')
  }

  const handleExportExcel = () => {
    // Implementar exportação Excel
    console.log('Exportar Excel')
  }

  // Loading state
  if (isLoading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' py={8}>
        <CircularProgress />
      </Box>
    )
  }

  // Empty state
  if (enrollments.length === 0) {
    return (
      <Alert severity='info'>Nenhum aluno inscrito neste curso ainda.</Alert>
    )
  }

  return (
    <Box>
      <Stack gap={3}>
        {/* Cards de Estatísticas */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction='row' alignItems='center' gap={1}>
                  <PeopleIcon color='primary' />
                  <Box>
                    <Typography variant='h4' fontWeight={700}>
                      {stats.total}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Total de Alunos
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction='row' alignItems='center' gap={1}>
                  <PendingIcon color='info' />
                  <Box>
                    <Typography variant='h4' fontWeight={700}>
                      {stats.emAndamento}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Em Andamento
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction='row' alignItems='center' gap={1}>
                  <CheckCircleIcon color='success' />
                  <Box>
                    <Typography variant='h4' fontWeight={700}>
                      {stats.concluidos}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Concluídos
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack direction='row' alignItems='center' gap={1}>
                  <TrendingUpIcon color='secondary' />
                  <Box>
                    <Typography variant='h4' fontWeight={700}>
                      {stats.taxaConclusao.toFixed(0)}%
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Taxa de Conclusão
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Barra de Ações */}
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'
          flexWrap='wrap'
          gap={2}
        >
          <TextField
            size='small'
            placeholder='Buscar aluno...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          <Stack direction='row' gap={1}>
            <Button
              variant='outlined'
              startIcon={<DownloadIcon />}
              onClick={handleExportPDF}
              size='small'
            >
              PDF
            </Button>
            <Button
              variant='outlined'
              startIcon={<DownloadIcon />}
              onClick={handleExportExcel}
              size='small'
            >
              Excel
            </Button>
          </Stack>
        </Stack>

        {/* Tabela de Alunos */}
        <TableContainer component={Paper} variant='outlined'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Aluno</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell align='center'>Progresso</TableCell>
                <TableCell align='center'>Módulos</TableCell>
                <TableCell align='center'>Nota Média</TableCell>
                <TableCell align='center'>Data Inscrição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEnrollments.map(enrollment => (
                <TableRow key={enrollment.id} hover>
                  <TableCell>
                    <Stack direction='row' alignItems='center' gap={1.5}>
                      <Avatar sx={{ width: 36, height: 36 }}>
                        {enrollment.funcionario.nome.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          {enrollment.funcionario.nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {enrollment.funcionario.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align='center'>
                    <Chip
                      label={getStatusLabel(enrollment.status)}
                      color={
                        getStatusColor(enrollment.status) as
                          | 'default'
                          | 'primary'
                          | 'secondary'
                          | 'error'
                          | 'info'
                          | 'success'
                          | 'warning'
                      }
                      size='small'
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Box sx={{ minWidth: 120 }}>
                      <Typography variant='body2' fontWeight={600} mb={0.5}>
                        {enrollment.progresso}%
                      </Typography>
                      <LinearProgress
                        variant='determinate'
                        value={enrollment.progresso}
                        color={
                          enrollment.progresso === 100
                            ? 'success'
                            : enrollment.progresso > 50
                              ? 'primary'
                              : 'warning'
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography variant='body2'>
                      {enrollment.modulos_completos}/{enrollment.total_modulos}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography
                      variant='body2'
                      fontWeight={600}
                      color={
                        enrollment.nota_media
                          ? enrollment.nota_media >= 7
                            ? 'success.main'
                            : 'error.main'
                          : 'text.secondary'
                      }
                    >
                      {enrollment.nota_media?.toFixed(1) || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography variant='caption'>
                      {new Date(enrollment.data_inscricao).toLocaleDateString(
                        'pt-BR'
                      )}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Box>
  )
}
