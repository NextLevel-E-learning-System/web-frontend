import { useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Alert,
} from '@mui/material'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { Link as RouterLink } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'
import { Send, Visibility, VisibilityOff } from '@mui/icons-material'
import { useLogin } from '@/hooks/auth'

export default function Login() {
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(true) // ← Padrão: sempre lembrar
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
            // Redirecionamento automático é feito pelo hook useLogin
          } catch (err) {
            console.error('[Login] Erro:', err)
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
          autoComplete='email'
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
          autoComplete='current-password'
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

        {/*        
        <FormControlLabel
          control={
            <Checkbox
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              color='primary'
            />
          }
          label='Manter-me conectado'
          sx={{ mt: 1, mb: 1 }}
        /> 
        */}

        <Button component={RouterLink} to='/recover' variant='text'>
          Esqueci minha senha
        </Button>

        {/* Mostrar erro se houver */}
        {login.error && (
          <Alert severity='error' sx={{ mt: 2 }}>
            Erro ao fazer login. Verifique suas credenciais.
          </Alert>
        )}

        <Button
          type='submit'
          fullWidth
          variant='contained'
          size='large'
          sx={{ mt: 2, borderRadius: 8 }}
          endIcon={<Send />}
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
