import { AppBar, Toolbar } from '@mui/material'
import NavigationMenu from './NavigationMenu'
import ProjectSelector from './ProjectSelector'
import UserMenu from './UserMenu'

export default function AppHeader() {
  return (
    <AppBar position="static">
      <Toolbar>
        <NavigationMenu />
        <ProjectSelector />
        <UserMenu />
      </Toolbar>
    </AppBar>
  )
}
