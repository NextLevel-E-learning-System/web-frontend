import { Box, Typography, Button, Stack, Paper } from '@mui/material'
import ModuleCreateDialog from '@/components/modules/ModuleCreateDialog'
import { useState } from 'react'
import { useCourseModules, useCreateModule } from '@/api/courses'

interface Props {
  courseCode: string
  isEdit: boolean
}
export default function CourseCurriculum({ courseCode, isEdit }: Props) {
  const { data: modules = [] } = useCourseModules(courseCode)
  const createModule = useCreateModule(courseCode)
  const [open, setOpen] = useState(false)
  return (
    <Box>
      <Stack direction='row' justifyContent='space-between' mb={2}>
        <Typography variant='subtitle1'>Módulos ({modules.length})</Typography>
        {isEdit && (
          <Button size='small' variant='outlined' onClick={() => setOpen(true)}>
            Novo Módulo
          </Button>
        )}
      </Stack>
      <Stack gap={1}>
        {modules
          .sort((a, b) => a.ordem - b.ordem)
          .map(m => (
            <Paper
              key={m.id}
              variant='outlined'
              sx={{ p: 1.5, display: 'flex', gap: 1 }}
            >
              <Typography fontWeight={600}>{m.titulo}</Typography>
              <Typography variant='caption' color='text.secondary'>
                XP: {m.xp}
              </Typography>
              {m.tipo_conteudo && (
                <Typography variant='caption' color='primary.main'>
                  {m.tipo_conteudo}
                </Typography>
              )}
            </Paper>
          ))}
        {modules.length === 0 && (
          <Typography variant='caption' color='text.secondary'>
            Nenhum módulo cadastrado ainda.
          </Typography>
        )}
      </Stack>
      <ModuleCreateDialog
        open={open}
        onClose={() => setOpen(false)}
        nextOrder={modules.length + 1}
        onCreate={async data => {
          await createModule.mutateAsync(data.module)
          return
        }}
        loading={createModule.isPending}
      />
    </Box>
  )
}
