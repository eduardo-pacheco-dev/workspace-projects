import AuthLayout from '../../components/auth/AuthLayout'
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm'

export default function ForgotPassword() {
  return (
    <AuthLayout
      headline="Recupere o acesso à sua conta"
      headlineSubtitle="Enviaremos um link de redefinição para o seu email."
      title="Recuperar Senha"
      subtitle="Informe seu email para receber o link de redefinição"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
