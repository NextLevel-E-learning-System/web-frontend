import { PropsWithChildren, useMemo, useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
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
  href?: string
  children?: NavItem[]
}

export default function DashboardLayout({
  title,
  items,
  children,
}: PropsWithChildren<{ title: string; items: NavItem[] }>) {
  const theme = useTheme()
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const location = useLocation()
  const { mutate } = useLogout()
  const currentPath = typeof location !== 'undefined' ? location.pathname : ''
  const { data: perfil } = useMeuPerfil()

  const avatarText = useMemo(() => {
    if (!perfil?.nome) return ''
    const partes = perfil.nome.trim().split(' ')
    if (partes.length === 1) return partes[0][0].toUpperCase()
    return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
  }, [perfil?.nome])

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Renderizar itens do menu mobile
  const renderMobileItems = (navItems: NavItem[], level = 0) => (
    <List disablePadding>
      {navItems.map((item, idx) => {
        const key = `${level}-${idx}-${item.label}`
        const hasChildren = !!item.children?.length
        const selected = currentPath === item.href || 
          (hasChildren && item.children!.some(c => c.href === currentPath))

        return (
          <Box key={key}>
            <ListItemButton
              component={item.href ? RouterLink : 'div'}
              to={item.href || ''}
              onClick={(e) => {
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
              {hasChildren && (
                openSections[key] ? <ExpandLess /> : <ExpandMore />
              )}
            </ListItemButton>
            {hasChildren && (
              <Collapse in={!!openSections[key]} timeout="auto" unmountOnExit>
                {renderMobileItems(item.children!, level + 1)}
              </Collapse>
            )}
          </Box>
        )
      })}
    </List>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* Header/Navbar */}
      <AppBar 
        position="sticky" 
        color="inherit"
        elevation={1}
        sx={{
          borderBottom: t => `1px solid ${t.palette.divider}`,
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'saturate(120%) blur(8px)',
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Logo */}
          
            <img src={logoIcon} alt="Logo NextLevel" style={{   height: 60 , }} />
          

          {/* Desktop Navigation - Centralizada */}
          <Box 
            component="nav" 
            sx={{ 
              display: { xs: 'none', md: 'flex' }, 
              alignItems: 'center', 
              justifyContent: 'center',
              flex: 1,
              gap: 1
            }}
          >
            {items.map((item, idx) => {
              const hasChildren = !!item.children?.length
              const isActive = currentPath === item.href || 
                (hasChildren && item.children!.some(c => c.href === currentPath))

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
                <Button
                  key={idx}
                  component={RouterLink}
                  to={item.href || ''}
                  variant="text"
                  sx={{
                    color: isActive ? 'primary.main' : 'text.primary',
                    fontWeight: isActive ? 600 : 500,
                    borderBottom: isActive ? '2px solid' : '2px solid transparent',
                    borderColor: isActive ? 'primary.main' : 'transparent',
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                    }
                  }}
                >
                  {item.label}
                </Button>
              )
            })}
          </Box>

          {/* Page Title - Mobile */}
          <Typography 
            variant="h6" 
            fontWeight={600}
            sx={{ 
              flexGrow: 1,
              display: { xs: 'block', md: 'none' },
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {title}
          </Typography>

          {/* Right side - User and Mobile Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {avatarText}
            </Avatar>
            
            <IconButton
              color="inherit"
              onClick={() => mutate(undefined)}
              size="small"
            >
              <LogoutIcon />
            </IconButton>

            {/* Mobile menu button */}
            <IconButton
              color="inherit"
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
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
            <img src={logoIcon} alt="Logo NextLevel" style={{ height: 60 }} />
            </Toolbar>
        <Divider />
        {renderMobileItems(items)}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#F5F7FB',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {/* Page Title - Desktop */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            bgcolor: 'background.paper',
            borderBottom: t => `1px solid ${t.palette.divider}`,
            py: 2,
            px: 3,
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

// Componente para dropdown de navegação
function NavDropdown({ 
  item, 
  isActive, 
  currentPath 
}: { 
  item: NavItem; 
  isActive: boolean;
  currentPath: string;
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
      <Button
        onClick={handleClick}
        endIcon={<ExpandMore />}
        variant="text"
        sx={{
          color: isActive ? 'primary.main' : 'text.primary',
          fontWeight: isActive ? 600 : 500,
          borderBottom: isActive ? '2px solid' : '2px solid transparent',
          borderColor: isActive ? 'primary.main' : 'transparent',
          borderRadius: 0,
          px: 2,
          py: 1,
          '&:hover': {
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 1,
          }
        }}
      >
        {item.label}
      </Button>
      
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
                }
              }
            }}
          >
           
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
