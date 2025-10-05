import { useState } from 'react'
import {
  Box,
  Stack,
  Typography,
  Button,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import { PictureAsPdf } from '@mui/icons-material'
import DescriptionIcon from '@mui/icons-material/Description'
import {
  useModuleMaterials,
  useUploadMaterial,
  useDeleteMaterial,
} from '@/api/courses'
import { convertFileToBase64 } from '@/api/courses'

interface Props {
  moduloId: string
}

export default function ModuleMaterialsPanel({ moduloId }: Props) {
  const { data: materialsRaw, isLoading } = useModuleMaterials(moduloId)
  const materials = Array.isArray(materialsRaw) ? materialsRaw : []
  const upload = useUploadMaterial(moduloId)
  const deleteMaterial = useDeleteMaterial()
  const [uploading, setUploading] = useState(false)

  // Debug: log dos dados recebidos
  console.log('ModuleMaterialsPanel - materialsRaw:', materialsRaw)
  console.log('ModuleMaterialsPanel - materials:', materials)
  console.log('ModuleMaterialsPanel - isLoading:', isLoading)

  const handleSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const base64 = await convertFileToBase64(file)
      await upload.mutateAsync({ nome_arquivo: file.name, base64 })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Tem certeza que deseja remover este material?')) return
    try {
      await deleteMaterial.mutateAsync(materialId)
    } catch (error) {
      console.error('Erro ao deletar material:', error)
    }
  }

  const iconFor = (tipo: string) => {
    if (tipo.includes('pdf'))
      return <PictureAsPdf fontSize='small' color='error' />
    return <DescriptionIcon fontSize='small' />
  }

  return (
    <Paper variant='outlined' sx={{ p: 2, display: 'grid', gap: 2 }}>
      <Stack direction='row' justifyContent='space-between' alignItems='center'>
        <Typography variant='subtitle2'>Materiais</Typography>
        <Button
          component='label'
          startIcon={<CloudUploadIcon />}
          size='small'
          disabled={uploading}
        >
          {uploading ? 'Enviando...' : 'Upload'}
          <input hidden type='file' onChange={handleSelectFile} />
        </Button>
      </Stack>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : materials.length === 0 ? (
        <Typography variant='body2' color='text.secondary'>
          Nenhum material.
        </Typography>
      ) : (
        <Stack gap={1}>
          {materials.map(m => (
            <Paper
              key={m.id}
              variant='outlined'
              sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              {iconFor(m.tipo_arquivo)}
              <Box sx={{ flex: 1 }}>
                <Typography variant='body2' fontWeight={600}>
                  {m.nome_arquivo}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {(Number(m.tamanho) / 1024).toFixed(1)} KB
                </Typography>
              </Box>
              <Tooltip title='Remover material'>
                <IconButton
                  size='small'
                  onClick={() => handleDeleteMaterial(m.id)}
                  disabled={deleteMaterial.isPending}
                >
                  <DeleteIcon fontSize='inherit' />
                </IconButton>
              </Tooltip>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  )
}
