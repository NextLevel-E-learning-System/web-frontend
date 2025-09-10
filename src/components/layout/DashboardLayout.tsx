import { PropsWithChildren, useState } from 'react'
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Button,
} from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import logoIcon from '@/assets/logo-icon.png'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import CircularProgress from '@mui/material/CircularProgress'
import { useLogout } from '@/hooks/auth'

export type NavItem = { label: string; icon: JSX.Element; href: string }

export default function DashboardLayout({
  title,
  items,
  children,
}: PropsWithChildren<{ title: string; items: NavItem[] }>) {
  const [open, setOpen] = useState(false)
  const isMdUp = useMediaQuery('(min-width:900px)')
  const location = useLocation()
  const drawerWidth = 240
  const { mutate, isPending } = useLogout()

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1f2937',
        color: '#e5e7eb',
      }}
    >
      <Toolbar sx={{ minHeight: 48, gap: 1 }}>
        <img src={logoIcon} alt='Logo NextLevel' style={{ width: 50 }} />
        <Typography variant='h6' fontWeight={800} color='#e5e7eb'>
          NextLevel
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.12)' }} />
      <List>
        {items.map(it => (
          <ListItemButton
            key={it.href}
            component={RouterLink}
            to={it.href}
            sx={{
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              color: '#e5e7eb',
              '&.Mui-selected,&:hover': { bgcolor: 'rgba(255,255,255,.06)' },
            }}
            selected={location.pathname === it.href}
          >
            <ListItemIcon sx={{ color: '#93c5fd', minWidth: 40 }}>
              {it.icon}
            </ListItemIcon>
            <ListItemText
              primaryTypographyProps={{ fontWeight: 600 }}
              primary={it.label}
            />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ p: 1, color: '#9ca3af', fontSize: 12 }}>
        {' '}
        © {new Date().getFullYear()}. NextLevel E-learning System
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F5F7FB' }}>
      <CssBaseline />
      <Box
        component='nav'
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label='sidebar'
      >
        <Drawer
          variant={isMdUp ? 'permanent' : 'temporary'}
          open={isMdUp ? true : open}
          onClose={() => setOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component='main' sx={{ flexGrow: 1, p: 0 }}>
        <AppBar
          position='sticky'
          color='inherit'
          elevation={0}
          sx={{
            borderBottom: t => `1px solid ${t.palette.divider}`,
            bgcolor: 'rgba(255,255,255,.9)',
            backdropFilter: 'saturate(120%) blur(6px)',
          }}
        >
          <Toolbar sx={{ gap: 2 }}>
            {!isMdUp && (
              <IconButton
                edge='start'
                color='inherit'
                onClick={() => setOpen(true)}
                aria-label='menu'
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant='h6' fontWeight={800} sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            <IconButton
              color='inherit'
              aria-label='logout'
              onClick={() => mutate(undefined)}
              disabled={isPending}
              sx={{ position: 'relative' }}
            >
              {isPending ? (
                <CircularProgress
                  size={24}
                  color='inherit'
                  sx={{ position: 'absolute', left: 6, top: 6 }}
                />
              ) : (
                <LogoutIcon />
              )}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  )
}
