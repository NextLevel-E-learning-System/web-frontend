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
import ConfirmationDialog from '../common/ConfirmationDialog'

interface Props {
  moduloId: string
}

export default function ModuleMaterialsPanel({ moduloId }: Props) {
  const { data: materialsRaw, isLoading } = useModuleMaterials(moduloId)
  const materials = Array.isArray(materialsRaw)
    ? materialsRaw.sort((a, b) =>
        a.nome_arquivo.localeCompare(b.nome_arquivo, 'pt-BR', { numeric: true })
      )
    : []
  const upload = useUploadMaterial(moduloId)
  const deleteMaterial = useDeleteMaterial()
  const [uploading, setUploading] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean
    materialId?: string
    materialName?: string
  }>({ open: false })

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

  const handleDeleteMaterial = async (
    materialId: string,
    materialName: string
  ) => {
    setConfirmDelete({ open: true, materialId, materialName })
  }

  const confirmDeleteMaterial = async () => {
    if (!confirmDelete.materialId) return
    try {
      await deleteMaterial.mutateAsync(confirmDelete.materialId)
      setConfirmDelete({ open: false })
    } catch (error) {
      console.error('Erro ao deletar material:', error)
      setConfirmDelete({ open: false })
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
        <Typography variant='h6'>Materiais</Typography>
        <Button
          component='label'
          startIcon={<CloudUploadIcon />}
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
                  onClick={() => handleDeleteMaterial(m.id, m.nome_arquivo)}
                  disabled={deleteMaterial.isPending}
                >
                  <DeleteIcon fontSize='inherit' />
                </IconButton>
              </Tooltip>
            </Paper>
          ))}
        </Stack>
      )}
      <ConfirmationDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false })}
        onConfirm={confirmDeleteMaterial}
        title='Remover Material'
        message={`Tem certeza que deseja remover o material "${confirmDelete.materialName}"? Esta ação não pode ser desfeita.`}
        confirmText='Remover'
        cancelText='Cancelar'
        severity='error'
        isLoading={deleteMaterial.isPending}
      />
    </Paper>
  )
}
