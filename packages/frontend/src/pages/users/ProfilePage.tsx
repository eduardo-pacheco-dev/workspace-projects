import { Container } from '@mui/material'
import ProfileForm from './ProfileForm'

export default function ProfilePage() {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <ProfileForm />
    </Container>
  )
}
