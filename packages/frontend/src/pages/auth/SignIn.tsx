import { Divider, Typography } from '@mui/material'
import AuthLayout from '../../components/auth/AuthLayout'
import SignInForm from '../../components/auth/SignInForm'
import GoogleButton from '../../components/auth/GoogleButton'
import AuthFooter from '../../components/auth/AuthFooter'

export default function SignIn() {
  return (
    <AuthLayout
      title="Login"
      subtitle="Acesse sua conta para gerenciar seus projetos"
    >
      <SignInForm />

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary">ou</Typography>
      </Divider>

      <GoogleButton />

      <AuthFooter message="Não tem conta?" linkText="Cadastre-se" linkTo="/signup" />
    </AuthLayout>
  )
}
