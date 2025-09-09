import { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Link as RouterLink } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'
import SendIcon from '@mui/icons-material/Send'

export default function Login() {
  const [showPass, setShowPass] = useState(false)
  return (
    <AuthShell title='Login'>
      <Box
        component='form'
        onSubmit={e => {
          e.preventDefault()
          window.location.href = '/dashboard'
        }}
      >
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
        <TextField
          fullWidth
          label='Senha'
          type={showPass ? 'text' : 'password'}
          required
          margin='normal'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <LockOutlinedIcon color='disabled' />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  onClick={() => setShowPass(s => !s)}
                  aria-label='Mostrar senha'
                >
                  {showPass ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button component={RouterLink} to='/recover' variant='text'>
          Esqueci minha senha
        </Button>
        <Button
          type='submit'
          fullWidth
          variant='contained'
          size='large'
          sx={{ mt: 2, borderRadius: 8 }}  endIcon={<SendIcon />}
        >
          Entrar
        </Button>
        <Typography variant='body2' sx={{ mt: 2, textAlign: 'center' }}>
          Não tem conta?{' '}
          <Button
            component={RouterLink}
            to='/register'
            variant='text'
            size='small'
          >
            Cadastrar
          </Button>
        </Typography>
      </Box>
    </AuthShell>
  )
}
