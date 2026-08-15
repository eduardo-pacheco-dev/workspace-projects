import { Divider, Typography } from '@mui/material'

interface FormSectionProps {
  title: string
  children: React.ReactNode
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <>
      <Typography variant="subtitle2" color="primary" sx={{ mt: 2, mb: 0.5 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {children}
    </>
  )
}
