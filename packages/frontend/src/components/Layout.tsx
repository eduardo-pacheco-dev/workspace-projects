import { Box } from '@mui/material'
import AppHeader from './layout/AppHeader'
import AppFooter from './layout/AppFooter'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <Box
        sx={{
          p: 3,
          minHeight: 'calc(100vh - 64px - 56px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>{children}</Box>
      </Box>
      <AppFooter />
    </>
  )
}
