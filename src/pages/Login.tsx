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
import { useLogin } from '@/hooks/auth'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()
  const login = useLogin()
  return (
    <AuthShell title='Login'>
      <Box
        component='form'
        onSubmit={async e => {
          e.preventDefault()
          const data = new FormData(e.currentTarget as HTMLFormElement)
          const email = String(data.get('email') || '')
          const senha = String(data.get('senha') || '')
          try {
            await login.mutateAsync({ email, senha })
            navigate('/dashboard')
          } catch (err) {
            console.error(err)
            alert('Falha no login')
          }
        }}
      >
        <TextField
          fullWidth
          label='Email'
          type='email'
          required
          margin='normal'
          name='email'
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
          name='senha'
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
          disabled={login.isPending}
        >
          {login.isPending ? 'Entrando...' : 'Entrar'}
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
