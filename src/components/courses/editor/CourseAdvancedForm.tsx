import { Stack, TextField, Button } from '@mui/material'
interface Props {
  form: any
  onChange: (u: any) => void
  onSave: () => void
  isEdit: boolean
}
export default function CourseAdvancedForm({ form, onChange, onSave }: Props) {
  const setField = (field: string, value: any) =>
    onChange((prev: any) => ({ ...prev, [field]: value }))
  return (
    <Stack gap={2}>
      <TextField
        label='Pré-requisitos (csv)'
        value={(form.pre_requisitos || []).join(',')}
        onChange={e =>
          setField(
            'pre_requisitos',
            e.target.value
              .split(',')
              .map((x: string) => x.trim())
              .filter(Boolean)
          )
        }
        size='small'
      />
      <TextField
        label='Nível'
        value={form.nivel_dificuldade}
        onChange={e => setField('nivel_dificuldade', e.target.value)}
        size='small'
      />
      <Button variant='contained' onClick={onSave}>
        Salvar Avançado
      </Button>
    </Stack>
  )
}
