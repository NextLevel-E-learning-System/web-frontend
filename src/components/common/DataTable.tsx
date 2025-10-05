import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
} from '@mui/material'
import React, { useMemo, type ReactNode } from 'react'

export interface Column {
  id: string
  label: string
  align?: 'left' | 'center' | 'right'
  minWidth?: number
  render?: (value: any, row: any, index: number) => ReactNode
}

interface DataTableProps<T extends Record<string, any> = Record<string, any>> {
  columns: Column[]
  data: T[]
  loading?: boolean
  size?: 'small'
  onRowClick?: (row: T, index: number) => void
  getRowId?: (row: T, index: number) => string | number
}

function DataTableInner<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  size = 'small',
  onRowClick,
  getRowId = (_, index) => index,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage)

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando...</Typography>
      </Box>
    )
  }

  const pageData = useMemo(
    () => data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [data, page, rowsPerPage]
  )

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table size={size} stickyHeader aria-label='sticky table'>
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageData.map((row, index) => {
              const actualIndex = page * rowsPerPage + index
              const rowId = getRowId(row, actualIndex)
              return (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={rowId}
                  onClick={
                    onRowClick ? () => onRowClick(row, actualIndex) : undefined
                  }
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map(column => {
                    const value = (row as any)[column.id]
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.render
                          ? column.render(value, row, actualIndex)
                          : value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component='div'
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage='Itens por página:'
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />
    </Paper>
  )
}

const DataTable = React.memo(DataTableInner) as typeof DataTableInner

export default DataTable
