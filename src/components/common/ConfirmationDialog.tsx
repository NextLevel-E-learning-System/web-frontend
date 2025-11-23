import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  CircularProgress
} from '@mui/material'
import {
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon
} from '@mui/icons-material'

interface ConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  severity?: 'error' | 'warning' | 'info'
}

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  severity = 'warning'
}: ConfirmationDialogProps) {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <ErrorIcon sx={{ color: getColor(), fontSize: 28 }} />
      case 'warning':
        return <WarningIcon sx={{ color: getColor(), fontSize: 28 }} />
      case 'info':
        return <InfoIcon sx={{ color: getColor(), fontSize: 28 }} />
      default:
        return <WarningIcon sx={{ color: getColor(), fontSize: 28 }} />
    }
  }

  const getColor = () => {
    switch (severity) {
      case 'error':
        return 'error.main'
      case 'warning':
        return 'warning.main'
      case 'info':
        return 'info.main'
      default:
        return 'warning.main'
    }
  }

  const getConfirmButtonColor = () => {
    switch (severity) {
      case 'error':
        return 'error'
      case 'warning':
        return 'warning'
      case 'info':
        return 'primary'
      default:
        return 'warning'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={!isLoading ? onClose : undefined}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {getIcon()}
          <Typography variant='h6' fontWeight={600}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Typography variant='body1' color='text.secondary'>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} disabled={isLoading} sx={{ minWidth: 100 }}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant='contained'
          color={getConfirmButtonColor()}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          sx={{ minWidth: 100 }}
        >
          {isLoading ? 'Processando...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
