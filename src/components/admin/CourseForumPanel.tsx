import { Box, Typography, Paper, Alert } from '@mui/material'
import { Forum as ForumIcon } from '@mui/icons-material'

interface CourseForumPanelProps {
  cursoCodigo: string
}

export default function CourseForumPanel({
  cursoCodigo,
}: CourseForumPanelProps) {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display='flex' alignItems='center' gap={2} mb={2}>
          <ForumIcon color='primary' fontSize='large' />
          <Typography variant='h5' fontWeight={600}>
            Fórum do Curso
          </Typography>
        </Box>

        <Alert severity='info' sx={{ mt: 2 }}>
          Funcionalidade de fórum em desenvolvimento. Em breve você poderá:
          <ul>
            <li>Visualizar perguntas dos alunos</li>
            <li>Responder dúvidas</li>
            <li>Criar discussões</li>
            <li>Marcar tópicos como resolvidos</li>
          </ul>
        </Alert>
      </Paper>
    </Box>
  )
}
