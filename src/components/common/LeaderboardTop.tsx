import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'

interface Player {
  name: string
  points: number
  avatarColor: string
}

interface Props {
  top3: [Player, Player, Player] // [1st, 2nd, 3rd]
}

export default function LeaderboardTop({ top3 }: Props) {
  const [first, second, third] = top3
  const card = (p: Player, place: 1 | 2 | 3, bg: string) => (
    <Card
      variant='outlined'
      sx={{ height: '100%', borderColor: 'divider', background: bg }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <EmojiEventsIcon
          sx={{
            color:
              place === 1 ? '#f59e0b' : place === 2 ? '#9ca3af' : '#d97706',
          }}
        />
        <Avatar sx={{ bgcolor: p.avatarColor, width: 56, height: 56 }}>
          {p.name[0]}
        </Avatar>
        <Typography fontWeight={800}>{p.name}</Typography>
        <Typography variant='body2' color='text.secondary'>
          {p.points.toLocaleString()} xp
        </Typography>
        <Box
          sx={{
            fontSize: 12,
            fontWeight: 700,
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: 'rgba(16,185,129,0.1)',
            color: '#059669',
          }}
        >
          Top {place}
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        {card(first, 1, 'linear-gradient(135deg,#fef9c3,#fee2e2)')}
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        {card(second, 2, 'linear-gradient(135deg,#e5e7eb,#ffffff)')}
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        {card(third, 3, 'linear-gradient(135deg,#fde68a,#ffedd5)')}
      </Grid>
    </Grid>
  )
}
