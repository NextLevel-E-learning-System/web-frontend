import { useRef, useState, useEffect } from 'react'
import {
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Slider,
} from '@mui/material'
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material'
import type { MaterialModulo } from '@/api/courses'

interface VideoPlayerProps {
  material: MaterialModulo
  onEnded?: () => void
  onProgress?: (percent: number) => void
  autoMarkComplete?: boolean
}

export default function VideoPlayer({
  material,
  onEnded,
  onProgress,
  autoMarkComplete = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [hasWatchedThreshold, setHasWatchedThreshold] = useState(false)

  // Threshold para considerar "assistido" (80% do vídeo)
  const WATCH_THRESHOLD = 0.8

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const current = video.currentTime
      const total = video.duration

      setCurrentTime(current)
      setDuration(total)

      if (total > 0) {
        const percent = (current / total) * 100
        setProgress(percent)
        onProgress?.(percent)

        // Marca como assistido quando atingir threshold
        if (percent >= WATCH_THRESHOLD * 100 && !hasWatchedThreshold) {
          setHasWatchedThreshold(true)
          if (autoMarkComplete) {
            onEnded?.()
          }
        }
      }
    }

    const handleEnded = () => {
      setPlaying(false)
      if (!hasWatchedThreshold) {
        onEnded?.()
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [onEnded, onProgress, hasWatchedThreshold, autoMarkComplete])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (playing) {
      video.pause()
    } else {
      video.play()
    }
    setPlaying(!playing)
  }

  const handleSeek = (_event: Event, value: number | number[]) => {
    const video = videoRef.current
    if (!video) return

    const time = ((value as number) / 100) * duration
    video.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (_event: Event, value: number | number[]) => {
    const video = videoRef.current
    if (!video) return

    const vol = value as number
    video.volume = vol
    setVolume(vol)
    setMuted(vol === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !muted
    setMuted(!muted)
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!fullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setFullscreen(!fullscreen)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // URL do vídeo (presigned URL do S3)
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
        ref={videoRef}
        src={videoUrl}
        style={{
          width: '100%',
          display: 'block',
          maxHeight: '70vh',
        }}
        onClick={togglePlay}
      />

      {/* Progress Bar */}
      <LinearProgress
        variant='determinate'
        value={progress}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: 'rgba(255,255,255,0.2)',
          '& .MuiLinearProgress-bar': {
            bgcolor: 'primary.main',
          },
        }}
      />

      {/* Controles */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          p: 2,
          color: 'white',
        }}
      >
        {/* Slider de tempo */}
        <Slider
          value={(currentTime / duration) * 100 || 0}
          onChange={handleSeek}
          sx={{
            mb: 1,
            color: 'white',
            '& .MuiSlider-thumb': {
              width: 12,
              height: 12,
            },
          }}
        />

        {/* Botões de controle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Play/Pause */}
          <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
            {playing ? <Pause /> : <PlayArrow />}
          </IconButton>

          {/* Tempo */}
          <Typography variant='caption'>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>

          <Box sx={{ flex: 1 }} />

          {/* Volume */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, width: 120 }}
          >
            <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
              {muted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.1}
              sx={{ color: 'white' }}
            />
          </Box>

          {/* Fullscreen */}
          <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
            {fullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Box>
      </Box>

      {/* Indicador de progresso mínimo */}
      {progress < WATCH_THRESHOLD * 100 && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 1,
          }}
        >
          <Typography variant='caption'>
            Assista pelo menos {WATCH_THRESHOLD * 100}% para concluir
          </Typography>
        </Box>
      )}
    </Box>
  )
}
