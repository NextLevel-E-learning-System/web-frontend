import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import SendIcon from '@mui/icons-material/Send'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Link as RouterLink } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'

export default function Recover() {
  return (
    <AuthShell title='Redefinir senha'>
      <Box
        component='form'
        onSubmit={e => {
          e.preventDefault()
          alert('Nova senha enviada.')
        }}
      >
        <Typography color='text.secondary' sx={{ mb: 2 }}>
          Informe seu email corporativo. Enviaremos uma nova senha.
        </Typography>
        <TextField
          fullWidth
          label='Email'
          type='email'
          required
          margin='normal'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <MailOutlineIcon color='disabled' />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
          <Button
            type='submit'
            variant='contained'
            size='large'
            sx={{ borderRadius: 8 }}
            endIcon={<SendIcon />}
          >
            Enviar
          </Button>
          <Button component={RouterLink} to='/login'  sx={{ borderRadius: 8 }} variant='outlined'  >
            Voltar ao login
          </Button>
        </Box>
      </Box>
    </AuthShell>
  )
}
