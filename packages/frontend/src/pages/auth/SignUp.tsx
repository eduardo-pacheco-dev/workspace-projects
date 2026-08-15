import AuthLayout from '../../components/auth/AuthLayout'
import SignUpForm from '../../components/auth/SignUpForm'

export default function SignUp() {
  return (
    <AuthLayout
      headline="Crie sua conta e comece a trabalhar"
      headlineSubtitle="Junte-se à nossa plataforma e gerencie seus projetos com facilidade."
      title="Criar conta"
      subtitle="Preencha os dados abaixo para se cadastrar"
    >
      <SignUpForm />
    </AuthLayout>
  )
}
