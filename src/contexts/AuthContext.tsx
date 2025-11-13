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
  xp_total?: number
  nivel?: string
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
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

  const login = (userData: User) => setUser(userData)
  const logout = () => setUser(null)

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    return Array.isArray(role) ? role.includes(user.role) : user.role === role
  }

  // Verificar autenticação ao carregar (cookie HTTP-only)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || ''
        const response = await fetch(`${baseUrl}/users/v1/funcionarios/me`, {
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
