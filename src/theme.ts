import { createTheme } from '@mui/material/styles'

export const brand = {
  primary: {
    main: '#2563eb', // blue-600
    light: '#3b82f6', // blue-500
    dark: '#1e40af', // blue-800
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#8b5cf6', // violet-500
    light: '#a78bfa',
    dark: '#6d28d9',
    contrastText: '#ffffff'
  },
  grey: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1f2937',
    900: '#0f172a'
  }
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: brand.primary,
    secondary: brand.secondary,
    background: {
      default: '#ffffff',
      paper: '#ffffff'
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569'
    }
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 12
        },
        containedPrimary: {
          background: 'linear-gradient(90deg, #2563eb, #8b5cf6)'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 600 }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundColor: '#ffffff', color: '#0f172a' }
      }
    }
  }
})

export default theme
