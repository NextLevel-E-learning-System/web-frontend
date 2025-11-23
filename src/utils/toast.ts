import { toast, type ToastOptions } from 'react-toastify'

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined
}

export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultOptions, ...options })
  },

  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultOptions, ...options })
  },

  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultOptions, ...options })
  },

  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultOptions, ...options })
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, { ...defaultOptions, ...options })
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId)
  },

  update: (
    toastId: string | number,
    options: ToastOptions & { render: string }
  ) => {
    toast.update(toastId, options)
  }
}

// Helper function to show error toast with backend message
export function showErrorToast(error: any) {
  // Tentar extrair mensagem do erro do Axios
  let message =
    error?.mensagem ||
    error?.response?.data?.mensagem ||
    error?.response?.data?.message ||
    error?.message

  // Fallback final
  if (!message) {
    message = 'Ocorreu um erro inesperado'
  }

  showToast.error(message)
}

// Helper function to show success toast with backend message
export function showSuccessToast(result: any) {
  const message = result?.mensagem
  if (message && typeof message === 'string') {
    showToast.success(message)
  }
  // Se não há mensagem do backend, não mostra toast
  // O backend deve sempre fornecer mensagens de sucesso apropriadas
}

// Loading messages são permitidos pois são mensagens de estado, não de resultado
export const loadingMessages = {
  saving: 'Salvando...',
  loading: 'Carregando...',
  sending: 'Enviando...',
  processing: 'Processando...'
}
