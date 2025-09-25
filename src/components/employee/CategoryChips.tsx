import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export interface TileCategory {
  label: string
  gradientFrom: string
  gradientTo: string
  icon?: React.ReactNode
  count?: number
}

interface Props {
  items: TileCategory[]
}

export default function CategoryChips({ items }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      {items.map(c => (
        <Box
          key={c.label}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            px: 2,
            py: 2,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})`,
            color: '#fff',
            fontWeight: 700,
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            minWidth: 120,
            maxWidth: 150,
            minHeight: 80,
            boxSizing: 'border-box',
            textAlign: 'center',
            flex: '0 0 auto',
          }}
        >
          {/* Ícone */}
          <Box sx={{ fontSize: 24, display: 'flex', alignItems: 'center' }}>
            {c.icon}
          </Box>
          
          {/* Nome da categoria */}
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 16,
              textAlign: 'center',
            }}
          >
            {c.label}
          </Typography>
          
          {/* Quantidade de cursos */}
          {typeof c.count === 'number' ? (
            <Typography sx={{ opacity: 0.9, fontSize: 12 }}>
              {c.count} courses
            </Typography>
          ) : null}
        </Box>
      ))}
    </Box>
  )
}
