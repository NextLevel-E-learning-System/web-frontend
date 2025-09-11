import {
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined'
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined'
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
  const { data: departamentos = [], isLoading: loadingDepartamentos } =
    useListarDepartamentos()
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

  const [selectedDepartamento, setSelectedDepartamento] = useState<any>(null)
  const [selectedCargo, setSelectedCargo] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar se departamento e cargo foram selecionados
    if (!selectedDepartamento || !selectedCargo) {
      showToast.error('Selecione um departamento e cargo válidos.')
      return
    }

    const submitData = {
      ...formData,
      departamento_id: selectedDepartamento.codigo,
      cargo: selectedCargo.nome,
    }

    try {
      await register.mutateAsync(submitData as any)
      showToast.success('Conta criada com sucesso! Senha enviada por email.')
      navigate('/login')
    } catch (err) {
      console.error(err)
      showToast.error('Falha ao criar conta. Tente novamente.')
    }
  }

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement> | any) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value as string,
      }))
    }
  return (
    <AuthShell title='Criar conta'>
      <Box component='form' onSubmit={handleSubmit}>
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
                <FingerprintOutlinedIcon color='disabled' />
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
                <PersonOutlineOutlinedIcon color='disabled' />
              </InputAdornment>
            ),
          }}
        />

        <Autocomplete
          fullWidth
          options={departamentosArray}
          getOptionLabel={option => option?.nome || ''}
          value={selectedDepartamento}
          onChange={(_, newValue) => setSelectedDepartamento(newValue)}
          loading={loadingDepartamentos}
          filterOptions={(options, { inputValue }) =>
            options.filter(option =>
              option.nome.toLowerCase().includes(inputValue.toLowerCase())
            )
          }
          renderInput={params => (
            <TextField
              {...params}
              label='Departamento'
              margin='normal'
              required
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position='start'>
                      <ApartmentOutlinedIcon color='disabled' />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          noOptionsText='Nenhum departamento encontrado'
          loadingText='Carregando departamentos...'
        />

        <Autocomplete
          fullWidth
          options={cargosArray}
          getOptionLabel={option => option?.nome || ''}
          value={selectedCargo}
          onChange={(_, newValue) => setSelectedCargo(newValue)}
          loading={loadingCargos}
          filterOptions={(options, { inputValue }) =>
            options.filter(option =>
              option.nome.toLowerCase().includes(inputValue.toLowerCase())
            )
          }
          renderInput={params => (
            <TextField
              {...params}
              label='Cargo'
              margin='normal'
              required
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position='start'>
                      <BadgeOutlinedIcon color='disabled' />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              }}
            />
          )}
          noOptionsText='Nenhum cargo encontrado'
          loadingText='Carregando cargos...'
        />

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
