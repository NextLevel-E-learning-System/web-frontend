import { PropsWithChildren, useMemo, useState, useEffect } from 'react'
import {
  AppBar,
  Avatar,
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
  useTheme,
  Collapse,
  Tooltip
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import logoIcon from '@/assets/logo-icon.png'

import { useLogout } from '@/hooks/auth'
import { useMeuPerfil } from '@/api/users'

export type NavItem = {
  label: string
  icon: JSX.Element
  href?: string
  children?: NavItem[]
}

const DRAWER_WIDTH = 240
const DRAWER_WIDTH_COLLAPSED = 72

export default function DashboardLayout({
  title,
  items,
  children,
}: PropsWithChildren<{ title: string; items: NavItem[] }>) {
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  
  // Melhor detecção de breakpoints para responsividade
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg')) // 1200px+
  const isMdUp = useMediaQuery(theme.breakpoints.up('md')) // 900px+
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm')) // 600px+
  
  const location = useLocation()
  const { mutate } = useLogout()
  const currentPath = typeof location !== 'undefined' ? location.pathname : ''
  const { data: perfil } = useMeuPerfil()
  
  // Auto-collapse sidebar em telas menores
  useEffect(() => {
    if (!isLgUp && !isCollapsed) {
      setIsCollapsed(true)
    } else if (isLgUp && isCollapsed) {
      setIsCollapsed(false)
    }
  }, [isLgUp, isCollapsed])
  
  // Fechar sidebar mobile ao redimensionar
  useEffect(() => {
    if (isMdUp && mobileOpen) {
      setMobileOpen(false)
    }
  }, [isMdUp, mobileOpen])
  
  const avatarText = useMemo(() => {
    if (!perfil?.nome) return ''
    const partes = perfil.nome.trim().split(' ')
    if (partes.length === 1) return partes[0][0].toUpperCase()
    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
  }, [perfil?.nome])

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const drawerWidth = useMemo(
    () =>
      isMdUp
        ? isCollapsed
          ? DRAWER_WIDTH_COLLAPSED
          : DRAWER_WIDTH
        : DRAWER_WIDTH,
    [isMdUp, isCollapsed]
  )

  const renderItems = (navItems: NavItem[], level = 0) => (
    <List disablePadding>
      {navItems.map((it, idx) => {
        const key = `${level}-${idx}-${it.label}`
        const hasChildren = !!it.children?.length
        const selected =
          currentPath === it.href ||
          (hasChildren && it.children!.some(c => c.href === currentPath))
        const content = (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              width: '100%',
            }}
          >
            <ListItemButton
              key={key}
              component={RouterLink}
              to={it.href || ''}
              onClick={e => {
                if (hasChildren && !isCollapsed) {
                  e.preventDefault()
                  toggleSection(key)
                }
                if (!isMdUp) setMobileOpen(false)
              }}
              selected={selected}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                pl: 1 + level * 2,
                color: '#e5e7eb',
                '&.Mui-selected,&:hover': { bgcolor: 'rgba(255,255,255,.06)' },
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#93c5fd',
                  minWidth: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {it.icon}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText
                  primaryTypographyProps={{ fontWeight: 600 }}
                  primary={it.label}
                />
              )}
              {hasChildren && (
                <IconButton
                  size='small'
                  edge='end'
                  sx={{
                    color: '#93c5fd',
                    ml: isCollapsed ? 0 : 0.5,
                    zIndex: 2,
                    alignSelf: 'center',
                    p: 0,
                    display: 'flex',
                  }}
                  onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleSection(key)
                  }}
                >
                  {openSections[key] ? (
                    <ExpandLess fontSize='small' />
                  ) : (
                    <ExpandMore fontSize='small' />
                  )}
                </IconButton>
              )}
            </ListItemButton>
          </Box>
        )

        return (
          <Box key={key}>
            {isCollapsed ? (
              <Tooltip title={it.label} arrow placement='right'>
                {content}
              </Tooltip>
            ) : (
              content
            )}
            {hasChildren &&
              (isCollapsed ? (
                openSections[key] ? (
                  <Box sx={{ pl: 0 }}>
                    {it.children!.map((child, cidx) => (
                      <Tooltip
                        title={child.label}
                        arrow
                        placement='right'
                        key={child.label + cidx}
                      >
                        <ListItemButton
                          component={RouterLink}
                          to={child.href || ''}
                          sx={{
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                            color: '#e5e7eb',
                            minHeight: 48,
                            justifyContent: 'center',
                            display: 'flex',
                          }}
                          selected={currentPath === child.href}
                        >
                          <ListItemIcon
                            sx={{
                              color: '#60a5fa',
                              minWidth: 36,
                              justifyContent: 'center',
                              display: 'flex',
                            }}
                          >
                            {child.icon}
                          </ListItemIcon>
                        </ListItemButton>
                      </Tooltip>
                    ))}
                  </Box>
                ) : null
              ) : (
                <Collapse in={!!openSections[key]} timeout='auto' unmountOnExit>
                  <Box sx={{ pl: 2 }}>
                    {renderItems(it.children!, level + 1)}
                  </Box>
                </Collapse>
              ))}
          </Box>
        )
      })}
    </List>
  )

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
      <Toolbar
        sx={{
          minHeight: 48,
          px: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
        }}
      >
        {!isCollapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <img src={logoIcon} alt='Logo NextLevel' style={{ width: 50 }} />
            <Typography
              variant='h6'
              fontWeight={800}
              color='#e5e7eb'
              sx={{ ml: 1 }}
            >
              NextLevel
            </Typography>
          </Box>
        )}
        {isMdUp && (
          <IconButton
            size='small'
            color='inherit'
            onClick={() => setIsCollapsed(v => !v)}
            aria-label='toggle sidebar'
            sx={{ ml: isCollapsed ? 0 : 2, alignSelf: 'center' }}
          >
            <MenuIcon />
          </IconButton>
        )}
        {!isMdUp && (
          <IconButton
            size='small'
            color='inherit'
            onClick={() => setMobileOpen(true)}
            aria-label='open drawer'
            sx={{ alignSelf: 'center' }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.12)' }} />
      <Box sx={{ flex: 1, overflow: 'auto' }}>{renderItems(items)}</Box>
    </Box>
  )

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      bgcolor: '#F5F7FB',
      // Evitar overflow horizontal
      maxWidth: '100vw',
      overflow: 'hidden'
    }}>
      <CssBaseline />
      <Box
        component='nav'
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 },
          // Garantir que não cause overflow
          minWidth: 0
        }}
        aria-label='sidebar'
      >
        <Drawer
          variant={isMdUp ? 'permanent' : 'temporary'}
          open={isMdUp ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 0,
              // Transição suave para mudanças de largura
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box 
        component='main' 
        sx={{ 
          flexGrow: 1, 
          p: 0,
          // Garantir que o conteúdo se ajuste adequadamente
          minWidth: 0,
          width: `calc(100vw - ${isMdUp ? drawerWidth : 0}px)`,
          // Melhor controle de overflow
          overflow: 'auto',
        }}
      >
        <AppBar
          position='sticky'
          color='inherit'
          elevation={0}
          sx={{
            borderBottom: t => `1px solid ${t.palette.divider}`,
            bgcolor: 'rgba(255,255,255,.9)',
            backdropFilter: 'saturate(120%) blur(6px)',
            // Ajustar largura baseado na sidebar
            width: '100%',
          }}
        >
          <Toolbar sx={{ 
            gap: 2,
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 }
          }}>
            {!isMdUp && (
              <IconButton
                color='inherit'
                aria-label='open drawer'
                edge='start'
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography 
              variant='h6' 
              fontWeight={800} 
              sx={{ 
                flexGrow: 1,
                // Evitar quebra em telas pequenas
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </Typography>
            <Avatar sx={{ width: 32, height: 32 }}>{avatarText}</Avatar>
            <IconButton
              color='inherit'
              aria-label='logout'
              onClick={() => mutate(undefined)}
            >
              <LogoutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ 
          p: { xs: 2, sm: 3 },
          // Garantir que o conteúdo se ajuste bem
          maxWidth: '100%',
          overflow: 'auto'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
