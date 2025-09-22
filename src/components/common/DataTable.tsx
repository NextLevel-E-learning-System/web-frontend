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
  Alert,
} from '@mui/material'
import { InboxOutlined } from '@mui/icons-material'
import { useState, ReactNode } from 'react'

export interface Column {
  id: string
  label: string
  align?: 'left' | 'center' | 'right'
  minWidth?: number
  render?: (value: any, row: any, index: number) => ReactNode
}

interface DataTableProps<T = any> {
  columns: Column[]
  data: T[]
  loading?: boolean
  emptyIcon?: ReactNode
  rowsPerPage?: number
  showPagination?: boolean
  stickyHeader?: boolean
  maxHeight?: number
  size?: 'small' | 'medium'
  onRowClick?: (row: T, index: number) => void
  getRowId?: (row: T, index: number) => string | number
}

export default function DataTable<T = any>({
  columns,
  data,
  loading = false,
  emptyIcon,
  rowsPerPage = 5,
  showPagination = true,
  stickyHeader = true,
  maxHeight = 600,
  size = 'small',
  onRowClick,
  getRowId = (_, index) => index,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(rowsPerPage)

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
  }

  // Dados paginados
  const paginatedData = showPagination
    ? data.slice(page * pageSize, page * pageSize + pageSize)
    : data

  const isEmpty = data.length === 0

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Carregando...</Typography>
      </Box>
    )
  }

  return (
    <Box>
      <TableContainer
        component={Paper}
        sx={{ 
          maxHeight: maxHeight, 
          overflow: 'auto',
          ...(isEmpty && { minHeight: 200 })
        }}
      >
        <Table size={size} stickyHeader={stickyHeader}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{ 
                    minWidth: column.minWidth,
                    backgroundColor: (theme) => theme.palette.mode === 'light' 
                      ? theme.palette.grey[50] 
                      : theme.palette.grey[900]
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 6,
                      gap: 2
                    }}
                  >
                    {emptyIcon || (
                      <InboxOutlined 
                        sx={{ 
                          fontSize: 64, 
                          color: 'text.disabled' 
                        }} 
                      />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const actualIndex = showPagination ? page * pageSize + index : index
                const rowId = getRowId(row, actualIndex)
                
                return (
                  <TableRow
                    key={rowId}
                    hover={!!onRowClick}
                    onClick={onRowClick ? () => onRowClick(row, actualIndex) : undefined}
                    sx={{
                      ...(onRowClick && { cursor: 'pointer' })
                    }}
                  >
                    {columns.map((column) => {
                      const value = row[column.id]
                      return (
                        <TableCell 
                          key={column.id} 
                          align={column.align || 'left'}
                        >
                          {column.render 
                            ? column.render(value, row, actualIndex) 
                            : value
                          }
                        </TableCell>
                      )
                    })}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && data.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={data.length}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Itens por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
          }
          sx={{
            backgroundColor: (theme) => theme.palette.mode === 'light' 
              ? theme.palette.grey[50] 
              : theme.palette.grey[900],
            border: (theme) => `1px solid ${theme.palette.divider}`,
            '& .MuiTablePagination-root': {
              backgroundColor: 'inherit',
            },
            '& .MuiTablePagination-toolbar': {
              backgroundColor: 'inherit',
            }
          }}
        />
      )}
    </Box>
  )
}