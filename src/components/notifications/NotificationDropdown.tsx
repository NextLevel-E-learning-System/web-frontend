import React, { useState } from 'react'
import {
  Badge,
  IconButton,
  Menu,
  Typography,
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material'
import {
  NotificationsOutlined as NotificationIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  useUnreadNotificationsCount,
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  type Notification,
} from '@/api/notifications'

export default function NotificationDropdown() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  // Hooks para dados
  const { data: unreadData } = useUnreadNotificationsCount()
  const { data: notificationsData, isLoading: notificationsLoading } =
    useNotifications({
      limit: 10,
    })
  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()

  const unreadCount = unreadData?.unreadCount ?? 0
  const notifications = notificationsData?.notifications ?? []

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate(notificationId)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: () => {
        handleClose()
      },
    })
  }

  const formatNotificationTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      })
    } catch {
      return 'Agora'
    }
  }

  return (
    <>
      <IconButton
        color='inherit'
        aria-label='notifications'
        onClick={handleClick}
        sx={{ color: 'text.secondary' }}
      >
        <Badge badgeContent={unreadCount} color='error'>
          <NotificationIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 480,
            mt: 1.5,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant='h6' fontWeight={600}>
              Notificações
            </Typography>
            {unreadCount > 0 && (
              <Button
                size='small'
                startIcon={<MarkReadIcon />}
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                Marcar todas como lidas
              </Button>
            )}
          </Box>
          {unreadCount > 0 && (
            <Typography variant='caption' color='text.secondary'>
              {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>

        {/* Loading State */}
        {notificationsLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Empty State */}
        {!notificationsLoading && notifications.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant='body2' color='text.secondary'>
              Nenhuma notificação encontrada
            </Typography>
          </Box>
        )}

        {/* Notifications List */}
        {!notificationsLoading && notifications.length > 0 && (
          <List sx={{ p: 0, maxHeight: 320, overflow: 'auto' }}>
            {notifications.map((notification: Notification, index: number) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    py: 1.5,
                    px: 2,
                    backgroundColor: !notification.lida
                      ? 'action.hover'
                      : 'transparent',
                    cursor: !notification.lida ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: !notification.lida
                        ? 'action.selected'
                        : 'action.hover',
                    },
                  }}
                  onClick={() =>
                    !notification.lida && handleMarkAsRead(notification.id)
                  }
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant='subtitle2'
                          fontWeight={!notification.lida ? 600 : 400}
                          sx={{ flex: 1 }}
                        >
                          {notification.titulo}
                        </Typography>
                        {!notification.lida && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'primary.main',
                              flexShrink: 0,
                              mt: 0.5,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {notification.mensagem}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Typography variant='caption' color='text.secondary'>
                            {formatNotificationTime(notification.data_criacao)}
                          </Typography>
                          {notification.tipo && (
                            <Chip
                              label={notification.tipo}
                              size='small'
                              variant='outlined'
                              sx={{ height: 20, fontSize: '0.6875rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1 }}>
              <Button
                fullWidth
                size='small'
                onClick={handleClose}
                sx={{ textTransform: 'none' }}
              >
                Ver todas as notificações
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  )
}
