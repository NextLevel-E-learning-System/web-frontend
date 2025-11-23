import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from 'react'

// Types
export type UserRole = 'FUNCIONARIO' | 'INSTRUTOR' | 'ADMIN'

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

  const login = (userData: User) => {
    setUser(userData)
    // Salvar dados do usuário no localStorage (não o token!)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false
    return Array.isArray(role) ? role.includes(user.role) : user.role === role
  }

  // Restaurar usuário do localStorage ao carregar
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const userData = JSON.parse(savedUser) as User
        setUser(userData)
      }
    } catch (error) {
      console.error('[AuthProvider] Erro ao restaurar usuário:', error)
      localStorage.removeItem('user')
    } finally {
      setIsLoading(false)
    }
  }, []) // Executa apenas uma vez ao montar

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole
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
