import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { Link as RouterLink } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'

export default function Register() {
  return (
    <AuthShell title='Criar conta'>
      <Box
        component='form'
        onSubmit={e => {
          e.preventDefault()
          window.location.href = '/dashboard'
        }}
      >
        <TextField
          fullWidth
          margin='normal'
          label='CPF'
          required
          inputMode='numeric'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <BadgeOutlinedIcon color='disabled' />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          margin='normal'
          label='Nome completo'
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <BadgeOutlinedIcon color='disabled' />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          fullWidth
          margin='normal'
          label='Departamento'
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <ApartmentOutlinedIcon color='disabled' />
              </InputAdornment>
            ),
          }}
        />
        <TextField fullWidth margin='normal' label='Cargo' required   InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <ApartmentOutlinedIcon color='disabled' />
              </InputAdornment>
            ),
          }}/>
        <TextField
          fullWidth
          margin='normal'
          label='Email corporativo'
          type='email'
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <MailOutlineIcon color='disabled' />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant='caption' color='text.secondary' sx={{ mt: 0 }}>
          A senha será enviada para seu email corporativo.
        </Typography>
        <Button
          type='submit'
          fullWidth
          variant='contained'
          size='large'
          sx={{ mt: 2, borderRadius: 8 }}
        >
          Criar conta
        </Button>
        <Typography variant='body2' sx={{ mt: 2, textAlign: 'center' }}>
          Já tem uma conta?{' '}
          <Button
            component={RouterLink}
            to='/login'
            variant='text'
            size='small'
          >
            Entrar
          </Button>
        </Typography>
      </Box>
    </AuthShell>
  )
}
