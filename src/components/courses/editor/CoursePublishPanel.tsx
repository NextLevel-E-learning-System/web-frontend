import {
  Stack,
  Typography,
  Switch,
  FormControlLabel,
  Button,
} from '@mui/material'

interface Props {
  form: any
  course: any
}
export default function CoursePublishPanel({ form, course }: Props) {
  return (
    <Stack gap={2}>
      <Typography variant='subtitle1'>Publicação</Typography>
      <FormControlLabel
        control={<Switch checked={form.ativo} />}
        label={form.ativo ? 'Ativo' : 'Inativo'}
      />
      <Typography variant='caption' color='text.secondary'>
        Status é salvo no painel básico por enquanto.
      </Typography>
      <Button variant='contained' disabled>
        Submeter para Revisão (placeholder)
      </Button>
      {course && (
        <Typography variant='caption'>
          Última atualização: {course.atualizado_em}
        </Typography>
      )}
    </Stack>
  )
}
