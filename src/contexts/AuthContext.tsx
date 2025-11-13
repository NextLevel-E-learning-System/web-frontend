import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

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
  login: (userId: string) => void
  logout: () => void
  hasRole: (role: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Função para fazer login
  const login = (userId: string) => {
    // Usuário será carregado posteriormente via API
    // Por enquanto, apenas marca como autenticado
    setUser({ id: userId } as User)
  }

  // Função para logout
  const logout = () => {
    setUser(null)
  }

  // Verificar se usuário tem role específica
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false

    if (Array.isArray(role)) {
      return role.includes(user.role)
    }

    return user.role === role
  }

  // Verificar autenticação ao inicializar
  // Como os cookies são HTTP-only, precisamos fazer uma requisição ao backend
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Fazer requisição para verificar se está autenticado
        // O cookie será enviado automaticamente
        const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${baseUrl}/auth/v1/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        }
      } catch (error) {
        console.error('[AuthProvider] Erro ao verificar autenticação:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
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
