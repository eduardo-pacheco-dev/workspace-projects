import { Box, CircularProgress } from '@mui/material'

interface PageLoaderProps {
  py?: number
}

export default function PageLoader({ py = 8 }: PageLoaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py }}>
      <CircularProgress />
    </Box>
  )
}
