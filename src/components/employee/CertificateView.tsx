import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent
} from '@mui/material'
import {
  WorkspacePremium as CertificateIcon,
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material'
import {
  useIssueCertificate,
  useGenerateCertificatePdf,
  type Certificate
} from '@/api/progress'
import { showToast } from '@/utils/toast'

interface CertificateViewProps {
  enrollmentId: string
  cursoTitulo: string
  dataConclusao?: string
  onCertificateIssued?: (certificate: Certificate) => void
  // Se já existir um certificado no banco, podemos passá-lo para
  // exibir o botão de download imediatamente.
  initialCertificate?: Certificate | null
}

export default function CertificateView({
  enrollmentId,
  cursoTitulo,
  dataConclusao,
  onCertificateIssued,
  initialCertificate = null
}: CertificateViewProps) {
  const [certificate, setCertificate] = useState<Certificate | null>(
    initialCertificate
  )

  // Atualiza se a prop inicial mudar (por exemplo, após o fetch em CourseContent)
  // Isso garante que o componente reflita certificados carregados posteriormente.
  useEffect(() => {
    setCertificate(initialCertificate)
  }, [initialCertificate])

  const issueMutation = useIssueCertificate()
  const generatePdfMutation = useGenerateCertificatePdf()

  const handleIssueCertificate = async () => {
    try {
      const response = await issueMutation.mutateAsync(enrollmentId)
      setCertificate(response.certificado)
      showToast.success('Certificado emitido com sucesso!')
      onCertificateIssued?.(response.certificado)
    } catch (error) {
      console.error('Erro ao emitir certificado:', error)
      showToast.error('Erro ao emitir certificado. Tente novamente.')
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await generatePdfMutation.mutateAsync(enrollmentId)
      window.open(response.downloadUrl, '_blank')
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      showToast.error('Erro ao gerar PDF do certificado. Tente novamente.')
    }
  }

  const isLoading = issueMutation.isPending || generatePdfMutation.isPending

  // Se não tem certificado, mostrar botão para emitir
  if (!certificate) {
    return (
      <Box sx={{ mx: 'auto' }}>
        <Paper
          variant='outlined'
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 1,
            borderColor: 'success.light',
            color: 'primary',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)'
            }}
          />

          <Stack spacing={3} alignItems='center' sx={{ position: 'relative' }}>
            <CertificateIcon sx={{ fontSize: 80, opacity: 0.9 }} />
            <Typography variant='h5' fontWeight={700}>
              Parabéns pela conclusão!
            </Typography>
            <Typography variant='body1' sx={{ maxWidth: 500, opacity: 0.95 }}>
              Você concluiu o curso <strong>{cursoTitulo}</strong>. Emita seu
              certificado para comprovar suas conquistas!
            </Typography>

            <Button
              variant='outlined'
              size='large'
              onClick={handleIssueCertificate}
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={20} color='inherit' />
                ) : (
                  <VerifiedIcon />
                )
              }
              sx={{
                mt: 2,
                bgcolor: 'white',
                color: 'primary.main',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)'
                }
              }}
            >
              Emitir Certificado
            </Button>

            {dataConclusao && (
              <Typography variant='body2' sx={{ mt: 2, opacity: 0.8 }}>
                Data de conclusão:{' '}
                {new Date(dataConclusao).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    )
  }

  // Se tem certificado, mostrar visualização
  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Alert
        severity='success'
        icon={<CheckIcon />}
        sx={{ mb: 3, borderRadius: 2 }}
      >
        <Typography variant='body2' color='text.secondary'>
          Seu certificado está disponível para download.
        </Typography>
      </Alert>

      <Card
        variant='outlined'
        sx={{
          borderRadius: 1,
          borderColor: 'success.light',
          color: 'primary',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)'
          }}
        />

        <CardContent sx={{ p: 4, position: 'relative' }}>
          <Stack spacing={3}>
            {/* Header */}
            <Box sx={{ textAlign: 'center' }}>
              <CertificateIcon sx={{ fontSize: 60, mb: 2, opacity: 0.9 }} />
              <Typography variant='h4' fontWeight={700} gutterBottom>
                Certificado de Conclusão
              </Typography>
              <Typography variant='body1' sx={{ opacity: 0.9 }}>
                {cursoTitulo}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.3)' }} />

            {/* Certificate Details */}
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant='caption'
                  sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}
                >
                  Código do Certificado
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {certificate.codigo_certificado}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant='caption'
                  sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}
                >
                  Data de Emissão
                </Typography>
                <Typography variant='body1' fontWeight={600}>
                  {new Date(certificate.data_emissao).toLocaleDateString(
                    'pt-BR',
                    {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    }
                  )}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant='caption'
                  sx={{ opacity: 0.8, display: 'block', mb: 0.5 }}
                >
                  Hash de Validação
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    fontFamily: 'monospace',
                    opacity: 0.9,
                    wordBreak: 'break-all'
                  }}
                >
                  {certificate.hash_validacao.slice(0, 32)}...
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.3)' }} />

            {/* Actions */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent='center'
            >
              <Button
                variant='outlined'
                size='large'
                onClick={handleDownloadPdf}
                disabled={isLoading}
                startIcon={
                  generatePdfMutation.isPending ? (
                    <CircularProgress size={20} color='inherit' />
                  ) : (
                    <DownloadIcon />
                  )
                }
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 600,
                  px: 4,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)'
                  }
                }}
              >
                Baixar Certificado
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
