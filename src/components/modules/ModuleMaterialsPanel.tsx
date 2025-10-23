import { useState } from 'react'
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import {
  OpenInNew,
  PictureAsPdfRounded,
  PlayCircleFilled,
} from '@mui/icons-material'
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
  const [mediaDialog, setMediaDialog] = useState<{
    open: boolean
    url?: string
    name?: string
    materialId?: string
    type?: string
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

  const handleOpenMedia = (
    url: string,
    name: string,
    materialId: string,
    type: string
  ) => {
    setMediaDialog({ url, name, materialId, type, open: true })
  }

  const handleCloseMedia = () => {
    setMediaDialog({ open: false })
  }

  const iconFor = (tipo: string) => {
    if (tipo.includes('pdf'))
      return <PictureAsPdfRounded color='error' sx={{ fontSize: 32 }} />
    if (tipo.includes('video'))
      return <PlayCircleFilled sx={{ color: 'primary.main', fontSize: 32 }} />
    return <DescriptionRoundedIcon sx={{ color: '#047857', fontSize: 32 }} />
  }

  return (
    <Box>
      <Stack direction='row' justifyContent='end' alignItems='center'>
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
        <Stack gap={1.5}>
          {materials.map(m => (
            <Box
              key={m.id}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: 'rgba(59,130,246,0.12)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {iconFor(m.tipo_arquivo)}
              <Stack sx={{ flex: 1 }}>
                <Typography variant='body1' fontWeight={600}>
                  {m.nome_arquivo}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {(Number(m.tamanho) / 1024 / 1024).toFixed(2)} MB
                </Typography>
              </Stack>
              <Tooltip title='Visualizar'>
                <IconButton
                  size='small'
                  onClick={() => {
                    if (m.url_download) {
                      handleOpenMedia(
                        m.url_download,
                        m.nome_arquivo,
                        m.id,
                        m.tipo_arquivo
                      )
                    }
                  }}
                  color='primary'
                >
                  <OpenInNew fontSize='inherit' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Remover material'>
                <IconButton
                  size='small'
                  onClick={() => handleDeleteMaterial(m.id, m.nome_arquivo)}
                  disabled={deleteMaterial.isPending}
                >
                  <DeleteIcon fontSize='inherit' />
                </IconButton>
              </Tooltip>
            </Box>
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

      {/* Modal para visualizar PDF ou Vídeo */}
      <Dialog
        open={mediaDialog.open}
        onClose={handleCloseMedia}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant='h6' fontWeight={600}>
            {mediaDialog.name}
          </Typography>
          <IconButton
            edge='end'
            color='inherit'
            onClick={handleCloseMedia}
            aria-label='fechar'
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {mediaDialog.url && (
            <Box
              sx={{ flex: 1, width: '100%', height: '100%', bgcolor: '#000' }}
            >
              {mediaDialog.type === 'pdf' ? (
                <iframe
                  src={`${mediaDialog.url}#toolbar=1&navpanes=1&scrollbar=1`}
                  width='100%'
                  height='100%'
                  style={{ border: 'none' }}
                  title={mediaDialog.name}
                />
              ) : (
                <video
                  controls
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                  src={mediaDialog.url}
                >
                  <source src={mediaDialog.url} type='video/mp4' />
                  Seu navegador não suporta a reprodução de vídeos.
                </video>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
