import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Alert,
  Grid,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import { PlayCircle, Article, PictureAsPdf } from '@mui/icons-material'
import VideoPlayer from '../learning/VideoPlayer'
import type { ModuloCompleto } from '@/api/courses'

interface ModuloPlayerProps {
  modulo: ModuloCompleto
  inscricaoId: string
}

export default function ModuloPlayer({
  modulo,
  inscricaoId: _inscricaoId
}: ModuloPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0)

  type StepData = {
    type: 'material'
    index: number
    label: string
    icon: React.ReactElement
    data: ModuloCompleto['materiais'][0]
  }

  const steps: StepData[] = []

  // Adicionar materiais
  modulo.materiais.forEach((material, idx) => {
    steps.push({
      type: 'material' as const,
      index: idx,
      label: material.nome_arquivo,
      icon: material.tipo_arquivo.includes('video') ? (
        <PlayCircle />
      ) : material.tipo_arquivo.includes('pdf') ? (
        <PictureAsPdf />
      ) : (
        <Article />
      ),
      data: material
    })
  })
  const currentStepData = steps[currentStep]

  return (
    <Box>
      {/* Layout: Sidebar + Conteúdo */}
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        {/* Sidebar com lista de materiais */}
        {steps.length > 1 && (
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              sx={{
                p: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 500
              }}
            >
              <Typography variant='subtitle2' color='text.secondary' mb={2}>
                CONTEÚDO DO MÓDULO
              </Typography>
              <List sx={{ flex: 1, overflow: 'auto' }}>
                {steps.map((step, index) => (
                  <ListItemButton
                    key={index}
                    selected={currentStep === index}
                    onClick={() => setCurrentStep(index)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark'
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white'
                        }
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      {step.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={step.label}
                      primaryTypographyProps={{
                        variant: 'body2',
                        noWrap: true
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>
        )}

        {/* Conteúdo do step atual */}
        <Grid size={{ xs: 12, md: steps.length > 1 ? 9 : 12 }}>
          <Paper
            sx={{
              p: 2,
              height: '100%',
              minHeight: 500,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {currentStepData?.type === 'material' &&
              currentStepData.data.tipo_arquivo?.includes('video') && (
              <VideoPlayer material={currentStepData.data} />
            )}

            {currentStepData?.type === 'material' &&
              currentStepData.data.tipo_arquivo?.includes('pdf') && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  {currentStepData.data.nome_arquivo}
                </Typography>
                {currentStepData.data.url_download ? (
                  <iframe
                    src={currentStepData.data.url_download}
                    style={{
                      width: '100%',
                      height: '80vh',
                      border: 'none'
                    }}
                    title={currentStepData.data.nome_arquivo}
                  />
                ) : (
                  <Alert severity='error'>
                      URL do material não disponível. Por favor, recarregue a
                      página.
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
