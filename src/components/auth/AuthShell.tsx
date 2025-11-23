import { Box, Container, Paper, Typography } from '@mui/material'

export default function AuthShell({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Box
      minHeight='100vh'
      sx={{
        background:
          'radial-gradient(1000px 420px at 10% -10%, rgba(18,131,230,.06), transparent), radial-gradient(900px 380px at 90% 0%, rgba(245,158,11,.05), transparent), linear-gradient(180deg,#F7FAFF 0%, #EDF3FA 100%)'
      }}
    >
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 12 } }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            p: { xs: 3, md: 4 },
            borderRadius: 8,
            border: '1px solid #E5EAF1',
            boxShadow: '0 6px 16px rgba(2,6,23,.06)',
            backgroundColor: '#FFFFFF'
          }}
        >
          <Typography
            variant='h4'
            fontWeight={800}
            sx={{ mb: 2, textAlign: 'center' }}
          >
            {title}
          </Typography>
          {children}
        </Paper>
      </Container>
    </Box>
  )
}
