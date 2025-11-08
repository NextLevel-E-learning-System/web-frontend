import {
  Box,
  Paper,
  Typography,
  Stack,
  Avatar,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material'
import { useCourseEnrollments } from '@/api/progress'

interface Props {
  cursoCodigo: string
}

export default function CourseStudentsPanel({ cursoCodigo }: Props) {
  const { data: enrollmentsData, isLoading: loadingEnrollments } =
    useCourseEnrollments(cursoCodigo)
  const enrollments = enrollmentsData || []

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

  // Loading state
  if (loadingEnrollments) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' py={8}>
        <CircularProgress />
      </Box>
    )
  }

  // Empty state
  if (enrollments.length === 0) {
    return <Alert severity='info'>Nenhuma inscrição neste curso.</Alert>
  }

  return (
    <Box>
      <Stack gap={3}>
        {/* Tabela de Funcionários */}
        <TableContainer component={Paper} variant='outlined'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Funcionário</TableCell>
                <TableCell align='center'>Status</TableCell>
                <TableCell align='center'>Progresso</TableCell>
                <TableCell align='center'>Módulos</TableCell>
                <TableCell align='center'>Nota Final</TableCell>
                <TableCell align='center'>Data Inscrição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.map(enrollment => (
                <TableRow key={enrollment.id} hover>
                  <TableCell>
                    <Stack direction='row' alignItems='center' gap={1.5}>
                      <Avatar sx={{ width: 36, height: 36 }}>
                        {enrollment.funcionario_nome.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          {enrollment.funcionario_nome}
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {enrollment.funcionario_email}
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
                        {enrollment.progresso_percentual}%
                      </Typography>
                      <LinearProgress
                        variant='determinate'
                        value={enrollment.progresso_percentual}
                        color={
                          enrollment.progresso_percentual === 100
                            ? 'success'
                            : enrollment.progresso_percentual > 50
                              ? 'warning'
                              : 'error'
                        }
                      />
                    </Box>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography variant='body2'>
                      {enrollment.modulos_concluidos}/{enrollment.total_modulos}
                    </Typography>
                  </TableCell>
                  <TableCell align='center'>
                    <Typography
                      variant='body2'
                      fontWeight={600}
                      color={
                        enrollment.nota_final
                          ? enrollment.nota_final >= 7
                            ? 'success.main'
                            : 'error.main'
                          : 'text.secondary'
                      }
                    >
                      {enrollment.nota_final}
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
