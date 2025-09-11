import './global.css'
import 'react-toastify/dist/ReactToastify.css'

import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import NotFound from './pages/NotFound'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Recover from './pages/Recover'
import EmployeeDashboard from './pages/EmployeeDashboard'
import AdminDashboard from './pages/AdminDashboard'
import InstrutorDashboard from './pages/InstrutorDashboard'
import CoursesPage from './pages/CoursesPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { queryClient } from './config/queryClient'

// NextLevel brand theme (Material UI)
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1283E6' },
    secondary: { main: '#111827' },
    error: { main: '#EF4444' },
    success: { main: '#16A34A' },
    warning: { main: '#F59E0B' },
    background: { default: '#F7FAFF', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#475569' },
  },
  typography: {
    fontFamily: `Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, \"Apple Color Emoji\", \"Segoe UI Emoji\"`,
    h1: { fontWeight: 800, letterSpacing: -0.5 },
    h2: { fontWeight: 800, letterSpacing: -0.4 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
      defaultProps: { elevation: 1 },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none', backdropFilter: 'saturate(120%) blur(6px)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #E5E7EB',
          boxShadow: '0 10px 30px rgba(2, 6, 23, .06)',
        },
      },
    },
    MuiTabs: { styleOverrides: { indicator: { height: 3, borderRadius: 3 } } },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, paddingLeft: 18, paddingRight: 18 },
        containedPrimary: { boxShadow: '0 12px 24px rgba(18,131,230,.22)' },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 8 } } },
  },
})

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/recover' element={<Recover />} />
          <Route
            path='/dashboard/funcionario'
            element={
              <ProtectedRoute allowedRoles={['funcionario']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/dashboard/admin'
            element={
              <ProtectedRoute allowedRoles={['administrador']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/dashboard/instrutor'
            element={
              <ProtectedRoute allowedRoles={['instrutor']}>
                <InstrutorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path='/cursos'
            element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            }
          />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </ThemeProvider>
  </QueryClientProvider>
)

createRoot(document.getElementById('root')!).render(<App />)
