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
import React from 'react'

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
  showPagination?: boolean
  stickyHeader?: boolean
  maxHeight?: number
  size?: 'small'
  onRowClick?: (row: T, index: number) => void
  getRowId?: (row: T, index: number) => string | number
}

export default function DataTable<T = any>({
  columns,
  data,
  loading = false,
  emptyIcon,
  showPagination = true,
  stickyHeader = true,
  maxHeight = 600,
  size = 'small',
  onRowClick,
  getRowId = (_, index) => index,
}: DataTableProps<T>) {
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(5)

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

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
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <TableRow hover role='checkbox' tabIndex={-1} key={index}>
                    {columns.map(column => {
                      const value = row[column.id]
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || 'left'}
                        >
                          {column.render
                            ? column.render(value, row, index)
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
