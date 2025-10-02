import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

export interface RankItem {
  rank: number
  name: string
  points: number
  change: number // positive up, negative down, 0 same
  avatarColor: string
}

interface Props {
  rows: RankItem[]
}

export default function RankingTable({ rows }: Props) {
  const Trend = ({ change }: { change: number }) => (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        fontWeight: 700,
        color:
          change > 0 ? '#16a34a' : change < 0 ? '#dc2626' : 'text.secondary',
      }}
    >
      {change > 0 ? (
        <ArrowDropUpIcon fontSize='small' />
      ) : change < 0 ? (
        <ArrowDropDownIcon fontSize='small' />
      ) : null}
      <Typography variant='body2'>
        {change === 0 ? '-' : Math.abs(change)}
      </Typography>
    </Box>
  )

  return (
    <Paper variant='outlined' sx={{ overflow: 'hidden', borderRadius: 2 }}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell width={64}>#</TableCell>
            <TableCell>Aluno</TableCell>
            <TableCell align='right'>Pontos</TableCell>
            <TableCell align='right'>Variação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(r => (
            <TableRow key={r.rank} hover>
              <TableCell>{r.rank}</TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    sx={{ bgcolor: r.avatarColor, width: 32, height: 32 }}
                  >
                    {r.name[0]}
                  </Avatar>
                  <Typography fontWeight={600}>{r.name}</Typography>
                </Box>
              </TableCell>
              <TableCell align='right'>
                {r.points.toLocaleString()} pts
              </TableCell>
              <TableCell align='right'>
                <Trend change={r.change} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  )
}
