import { Button, Paper, Stack, Typography } from '@mui/material'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'

interface QuickAccessButtonsProps {
  onNewIncome: () => void
  onNewExpense: () => void
  onNewTransfer: () => void
}

export default function QuickAccessButtons({ onNewIncome, onNewExpense, onNewTransfer }: QuickAccessButtonsProps) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Acesso Rápido</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Button fullWidth variant="contained" color="success" startIcon={<ArrowUpwardIcon />} onClick={onNewIncome}>
          Nova Receita
        </Button>
        <Button fullWidth variant="contained" color="error" startIcon={<ArrowDownwardIcon />} onClick={onNewExpense}>
          Nova Despesa
        </Button>
        <Button fullWidth variant="contained" color="info" startIcon={<SwapHorizIcon />} onClick={onNewTransfer}>
          Nova Transferência
        </Button>
      </Stack>
    </Paper>
  )
}
