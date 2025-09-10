import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import { Link as RouterLink } from 'react-router-dom'
import AuthShell from '@/components/auth/AuthShell'
import { useRegister } from '@/hooks/auth'
import { useNavigate } from 'react-router-dom'
import { useListarDepartamentos, useListarCargos } from '@/hooks/users'
import { useState } from 'react'
import { showToast } from '@/utils/toast'

const Register = () => {
  const navigate = useNavigate()
  const register = useRegister()
  const { data: departamentos = [], isLoading: loadingDepartamentos } = useListarDepartamentos()
  const { data: cargos = [], isLoading: loadingCargos } = useListarCargos()
  
  const departamentosArray = Array.isArray(departamentos) ? departamentos : []
  const cargosArray = Array.isArray(cargos) ? cargos : []
  
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    email: '',
    departamento_id: '',
    cargo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register.mutateAsync(formData as any)
      showToast.success('Conta criada com sucesso! Senha enviada por email.')
      navigate('/login')
    } catch (err) {
      console.error(err)
      showToast.error('Falha ao criar conta. Tente novamente.')
    }
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement> | any) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value as string
    }))
  }
  return (
    <AuthShell title='Criar conta'>
      <Box
        component='form'
        onSubmit={handleSubmit}
      >
        <TextField
          fullWidth
          margin='normal'
          label='CPF'
          name='cpf'
          value={formData.cpf}
          onChange={handleChange('cpf')}
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
          name='nome'
          value={formData.nome}
          onChange={handleChange('nome')}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <BadgeOutlinedIcon color='disabled' />
              </InputAdornment>
            ),
          }}
        />

        <FormControl fullWidth margin='normal' required>
          <InputLabel>Departamento</InputLabel>
          <Select
            value={formData.departamento_id}
            onChange={handleChange('departamento_id')}
            label='Departamento'
            disabled={loadingDepartamentos}
            startAdornment={
              <InputAdornment position='start'>
                <ApartmentOutlinedIcon color='disabled' />
              </InputAdornment>
            }
          >
            {departamentosArray.map((dept) => (
              <MenuItem key={dept.codigo} value={dept.codigo}>
                {dept.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin='normal' required>
          <InputLabel>Cargo</InputLabel>
          <Select
            value={formData.cargo}
            onChange={handleChange('cargo')}
            label='Cargo'
            disabled={loadingCargos}
            startAdornment={
              <InputAdornment position='start'>
                <ApartmentOutlinedIcon color='disabled' />
              </InputAdornment>
            }
          >
            {cargosArray.map((cargo) => (
              <MenuItem key={cargo.id} value={cargo.nome}>
                {cargo.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <TextField
          fullWidth
          margin='normal'
          label='Email corporativo'
          name='email'
          type='email'
          value={formData.email}
          onChange={handleChange('email')}
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
          disabled={register.isPending}
        >
          {register.isPending ? 'Enviando...' : 'Criar conta'}
        </Button>
        
        <Typography variant='body2' sx={{ mt: 2, textAlign: 'center' }}>
          Já tem uma conta?{' '}
          <Button
            component={RouterLink}
            to='/login'
            variant='text'
            size='small'
          >
            Fazer login
          </Button>
        </Typography>
      </Box>
    </AuthShell>
  )
}

export default Register
