import { toast, ToastOptions } from 'react-toastify'

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
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
  
  update: (toastId: string | number, options: ToastOptions & { render: string }) => {
    toast.update(toastId, options)
  }
}

// Shortcuts para mensagens comuns
export const toastMessages = {
  success: {
    saved: 'Dados salvos com sucesso!',
    created: 'Criado com sucesso!',
    updated: 'Atualizado com sucesso!',
    deleted: 'Excluído com sucesso!',
    sent: 'Enviado com sucesso!',
  },
  
  error: {
    generic: 'Ocorreu um erro. Tente novamente.',
    network: 'Erro de conexão. Verifique sua internet.',
    validation: 'Verifique os dados preenchidos.',
    notFound: 'Item não encontrado.',
    unauthorized: 'Você não tem permissão para esta ação.',
  },
  
  loading: {
    saving: 'Salvando...',
    loading: 'Carregando...',
    sending: 'Enviando...',
    processing: 'Processando...',
  }
}
