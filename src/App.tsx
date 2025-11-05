import './global.css'
import 'react-toastify/dist/ReactToastify.css'

import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import NotFound from './pages/NotFound'
import { CssBaseline, ThemeProvider } from '@mui/material'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Recover from './pages/Recover'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDepartments from './pages/admin/AdminDepartments'
import AdminCategories from './pages/admin/AdminCategories'
import AdminUsers from './pages/admin/AdminUsers'
import AdminInstructors from './pages/admin/AdminInstructors'
import AdminCourses from './pages/admin/AdminCourses'
import CourseEditorPage from './pages/admin/CourseEditorPage'
import InstrutorDashboard from './pages/instrutor/InstrutorDashboard'
import CoursesPage from './pages/employee/CoursesPage'
import CourseContent from './pages/employee/CourseContent'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { queryClient } from './config/queryClient'
import theme from './theme'
import ProgressPage from './pages/employee/ProgressPage'
import RankingPage from './pages/employee/RankingPage'
import { AuthProvider } from './contexts/AuthContext'
import ProgressoAlunos from './pages/instrutor/AlunosTurmas'

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/recover' element={<Recover />} />
            <Route
              path='/dashboard/funcionario'
              element={
                <ProtectedRoute allowedRoles={['ALUNO']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/admin'
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/gerenciar/departamentos'
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDepartments />
                </ProtectedRoute>
              }
            />
            <Route
              path='/gerenciar/categorias'
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path='/gerenciar/funcionarios'
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'GERENTE']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path='/gerenciar/instrutores'
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminInstructors />
                </ProtectedRoute>
              }
            />
            <Route
              path='/gerenciar/cursos'
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN', 'GERENTE', 'INSTRUTOR']}
                >
                  <AdminCourses />
                </ProtectedRoute>
              }
            />
            <Route
              path='/gerenciar/cursos/novo-curso'
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN', 'GERENTE', 'INSTRUTOR']}
                >
                  <CourseEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/gerenciar/cursos/:codigo'
              element={
                <ProtectedRoute
                  allowedRoles={['ADMIN', 'GERENTE', 'INSTRUTOR']}
                >
                  <CourseEditorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/dashboard/instrutor'
              element={
                <ProtectedRoute allowedRoles={['INSTRUTOR']}>
                  <InstrutorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/turmas'
              element={
                <ProtectedRoute
                  allowedRoles={['INSTRUTOR', 'ADMIN', 'GERENTE']}
                >
                  <ProgressoAlunos />
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
            <Route
              path='/cursos/:codigo'
              element={
                <ProtectedRoute allowedRoles={['ALUNO']}>
                  <CourseContent />
                </ProtectedRoute>
              }
            />
            <Route
              path='/meu-progresso'
              element={
                <ProtectedRoute allowedRoles={['ALUNO']}>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route
              path='/ranking'
              element={
                <ProtectedRoute>
                  <RankingPage />
                </ProtectedRoute>
              }
            />
            <Route path='*' element={<NotFound />} />
          </Routes>
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
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
)

createRoot(document.getElementById('root')!).render(<App />)
