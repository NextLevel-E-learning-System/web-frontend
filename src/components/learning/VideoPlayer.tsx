import { useRef } from 'react'
import { Box, Typography } from '@mui/material'
import type { MaterialModulo } from '@/api/courses'

interface VideoPlayerProps {
  material: MaterialModulo
}

export default function VideoPlayer({ material }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const videoUrl = material.url_download || ''

  if (!videoUrl) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper' }}>
        <Typography color='error'>
          Erro ao carregar vídeo. URL não disponível.
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      sx={{ position: 'relative', width: '100%', bgcolor: 'black' }}
    >
      {/* Vídeo */}
      <video
        controls
        ref={videoRef}
        src={videoUrl}
        style={{
          width: '100%',
          display: 'block',
          maxHeight: '70vh',
        }}
      />
    </Box>
  )
}
