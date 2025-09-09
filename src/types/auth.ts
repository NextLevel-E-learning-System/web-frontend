export type LoginInput = { email: string; senha: string }
export type LoginResponse = {
  accessToken: string
  tokenType: string
  expiresInHours: number
}

export type RegisterInput = {
  nome: string
  cpf: string
  email: string
  departamento_id: string
  cargo: string
}
export type RegisterResponse = {
  id: string
  nome: string
  cpf: string
  email: string
  departamento_id: string
  cargo: string
  tipo_usuario: string
  status: string
  mensagem: string
}

export type ResetPasswordInput = { email?: string; userId?: string }
export type ResetPasswordResponse = { sucesso: boolean }
