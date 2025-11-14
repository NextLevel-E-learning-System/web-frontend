import { useMemo, useState, type PropsWithChildren } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Collapse,
  Link,
} from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import LogoutIcon from '@mui/icons-material/Logout'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import logoIcon from '@/assets/logo-icon.png'

import { useLogout } from '@/hooks/auth'
import { useAuth } from '@/contexts/AuthContext'

export type NavItem = {
  label: string
  href?: string
  children?: NavItem[]
}

export default function DashboardLayout({
  items,
  children,
}: PropsWithChildren<{ items: NavItem[] }>) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const location = useLocation()
  const { mutate } = useLogout()
  const { user } = useAuth()
  const currentPath = typeof location !== 'undefined' ? location.pathname : ''

  const avatarText = useMemo(() => {
    if (!user?.nome) return ''
    const partes = user.nome.trim().split(' ')
    if (partes.length === 1) return partes[0][0].toUpperCase()
    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
  }, [user?.nome])

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Renderizar itens do menu mobile
  const renderMobileItems = (navItems: NavItem[], level = 0) => (
    <List disablePadding>
      {navItems.map((item, idx) => {
        const key = `${level}-${idx}-${item.label}`
        const hasChildren = !!item.children?.length
        const selected =
          currentPath === item.href ||
          (hasChildren && item.children!.some(c => c.href === currentPath))

        return (
          <Box key={key}>
            <ListItemButton
              component={item.href ? RouterLink : 'div'}
              to={item.href || ''}
              onClick={(e: { preventDefault: () => void }) => {
                if (hasChildren) {
                  e.preventDefault()
                  toggleSection(key)
                } else {
                  setMobileOpen(false)
                }
              }}
              selected={selected}
              sx={{
                pl: 2 + level * 2,
                borderRadius: 1,
                mx: 1,
                my: 0.5,
              }}
            >
              <ListItemText primary={item.label} />
              {hasChildren &&
                (openSections[key] ? <ExpandLess /> : <ExpandMore />)}
            </ListItemButton>
            {hasChildren && (
              <Collapse in={!!openSections[key]} timeout='auto' unmountOnExit>
                {renderMobileItems(item.children!, level + 1)}
              </Collapse>
            )}
          </Box>
        )
      })}
    </List>
  )

  return (
    <Box>
      {/* Header/Navbar */}
      <AppBar
        position='sticky'
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'rgba(255,255,255,0.95)',
          color: 'text.primary',
          backdropFilter: 'saturate(180%) blur(8px)',
        }}
      >
        <Toolbar disableGutters sx={{ gap: 3, px: 2 }}>
          {/* Mobile menu button - Left side */}
          <IconButton
            color='inherit'
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo - Hidden on mobile */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <img src={logoIcon} alt='Logo NextLevel' style={{ height: 60 }} />
          </Box>

          {/* Desktop Navigation - Centralizada */}
          <Box
            component='nav'
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              flex: '8',
              gap: 3,
            }}
          >
            {items.map((item, idx) => {
              const hasChildren = !!item.children?.length
              const isActive =
                currentPath === item.href ||
                (hasChildren &&
                  item.children!.some(c => c.href === currentPath))

              if (hasChildren) {
                return (
                  <NavDropdown
                    key={idx}
                    item={item}
                    isActive={isActive}
                    currentPath={currentPath}
                  />
                )
              }

              return (
                <Link
                  key={idx}
                  component={RouterLink}
                  to={item.href || ''}
                  underline='none'
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    transition: 'color .2s ease',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </Box>

          {/* Right side - User and Logout */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              justifyContent: 'end',
              flex: 2,
            }}
          >
            <Avatar sx={{ width: 32, height: 32 }}>{avatarText}</Avatar>

            <IconButton
              color='inherit'
              onClick={() => mutate(undefined)}
              size='small'
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant='temporary'
        anchor='left'
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 200,
          },
        }}
      >
        <Toolbar>
          <img src={logoIcon} alt='Logo NextLevel' style={{ height: 60 }} />
        </Toolbar>
        <Divider />
        {renderMobileItems(items)}
      </Drawer>

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          bgcolor: '#F5F7FB',
          minHeight: { xs: 'calc(100vh + 235px)', md: 'calc(100vh - 74px)' },
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
    </Box>
  )
}

// Componente para dropdown de navegação
function NavDropdown({
  item,
  isActive,
  currentPath,
}: {
  item: NavItem
  isActive: boolean
  currentPath: string
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={handleClick}
      >
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 600,
            transition: 'color .2s ease',
            '&:hover': { color: 'text.primary' },
            color: isActive ? 'primary.main' : 'text.secondary',
          }}
        >
          {item.label}
        </Typography>
        <ExpandMore />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {item.children?.map((child, idx) => (
          <MenuItem
            key={idx}
            component={RouterLink}
            to={child.href || ''}
            onClick={handleClose}
            selected={currentPath === child.href}
            sx={{
              minWidth: 200,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemText primary={child.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
