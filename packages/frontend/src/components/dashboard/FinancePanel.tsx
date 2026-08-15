import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'

interface FinancePanelProps {
  income: number
  expenses: number
  balance: number
}

const FINANCE_ITEMS = [
  { key: 'income', label: 'Receitas', color: '#2e7d32' },
  { key: 'expenses', label: 'Despesas', color: '#c62828' },
  { key: 'balance', label: 'Saldo', color: '#1565c0' },
] as const

export default function FinancePanel({ income, expenses, balance }: FinancePanelProps) {
  const navigate = useNavigate()
  const values = { income, expenses, balance }

  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Finanças do Mês
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={2}>
        {FINANCE_ITEMS.map((item) => (
          <Box key={item.key}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {item.label}
              </Typography>
              <Typography variant="h6" sx={{ color: item.color, fontWeight: 700 }}>
                {formatCurrency(values[item.key])}
              </Typography>
            </Box>
            <Box sx={{ mt: 0.5, height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <Box sx={{ width: '100%', height: '100%', borderRadius: 3, background: item.color, opacity: 0.7 }} />
            </Box>
          </Box>
        ))}
      </Stack>
      <Button fullWidth sx={{ mt: 3 }} endIcon={<ArrowForwardIcon />} onClick={() => navigate('/finance')}>
        Abrir Finanças
      </Button>
    </Paper>
  )
}
