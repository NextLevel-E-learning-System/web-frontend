import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getAccessToken, clearAccessToken } from '@/api/http'
import { jwtDecode } from 'jwt-decode'

// Types
export type UserRole = 'FUNCIONARIO' | 'INSTRUTOR' | 'ADMIN' | 'GERENTE'

export interface User {
  id: string
  email: string
  nome: string
  role: UserRole
  departamento_id?: string
  cargo_nome?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string) => void
  hasRole: (role: UserRole | UserRole[]) => boolean
}

// Estrutura esperada do JWT token
interface JWTPayload {
  sub: string // user id
  email: string
  nome?: string
  roles: UserRole | UserRole[] // Pode ser string ou array
  departamento_id?: string
  cargo_nome?: string
  ativo: boolean
  exp: number
  iat: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Função para decodificar token e extrair dados do usuário
  const decodeToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<JWTPayload>(token)

      // Verificar se token não está expirado
      const currentTime = Date.now() / 1000
      if (decoded.exp < currentTime) {
        console.warn('[AuthProvider] Token expirado')
        clearAccessToken()
        return null
      }

      // Extrair role (pode ser string ou array)
      const userRole = Array.isArray(decoded.roles)
        ? decoded.roles[0]
        : decoded.roles

      return {
        id: decoded.sub,
        email: decoded.email,
        nome: decoded.nome || decoded.email, // Fallback se não tiver nome
        role: userRole,
        departamento_id: decoded.departamento_id,
        cargo_nome: decoded.cargo_nome,
      }
    } catch (error) {
      console.error('[AuthProvider] Erro ao decodificar token:', error)
      clearAccessToken()
      return null
    }
  }

  // Função para fazer login
  const login = (token: string) => {
    const userData = decodeToken(token)
    if (userData) {
      setUser(userData)
    }
  }

  // Verificar se usuário tem role específica
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false

    if (Array.isArray(role)) {
      return role.includes(user.role)
    }

    return user.role === role
  }

  // Verificar token ao inicializar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getAccessToken()
        if (token) {
          const userData = decodeToken(token)
          if (userData) {
            setUser(userData)
          }
        }
      } catch (error) {
        console.error('[AuthProvider] Erro na inicialização:', error)
        clearAccessToken()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto de autenticação
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
