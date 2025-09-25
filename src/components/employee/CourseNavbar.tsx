import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import { Link as RouterLink, useLocation } from 'react-router-dom'

interface Props {
  title?: string
}

export default function CourseNavbar({ title = 'Learnify' }: Props) {
  const location = useLocation()
  const routes = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/courses', label: 'Courses' },
    { href: '/browse', label: 'Browse' },
    { href: '/progress', label: 'Progress' },
    { href: '/community', label: 'Community' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard')
      return (
        location.pathname === '/' || location.pathname.startsWith('/dashboard')
      )
    return location.pathname.startsWith(href)
  }

  return (
    <AppBar
      position='sticky'
      elevation={0}
      sx={{
        top: 0,
        zIndex: t => t.zIndex.appBar,
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'rgba(255,255,255,0.95)',
        color: 'text.primary',
        backdropFilter: 'saturate(180%) blur(8px)',
      }}
    >
      <Container maxWidth='lg'>
        <Toolbar
          disableGutters
          sx={{
            height: 64,
            px: 2,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box
            component={RouterLink}
            to='/'
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <MenuBookIcon sx={{ color: 'primary.main' }} />
            <Typography variant='h6' fontWeight={800}>
              {title}
            </Typography>
          </Box>

          <Box
            component='nav'
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 3,
            }}
          >
            {routes.map(r => (
              <Link
                key={r.href}
                component={RouterLink}
                to={r.href}
                underline='none'
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: isActive(r.href) ? 'text.primary' : 'text.secondary',
                  borderBottom: isActive(r.href) ? 2 : 0,
                  borderColor: isActive(r.href)
                    ? 'primary.main'
                    : 'transparent',
                  pb: 0.75,
                  transition: 'color .2s ease',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {r.label}
              </Link>
            ))}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              component={RouterLink}
              to='/browse'
              sx={{
                display: { xs: 'flex', md: 'none' },
                border: 1,
                borderColor: 'divider',
              }}
            >
              <SearchIcon sx={{ color: 'text.secondary' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
