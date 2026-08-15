import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../../contexts/ProjectContext'

interface DashboardHeaderProps {
  userName: string
  isMaster: boolean
}

export default function DashboardHeader({ userName, isMaster }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const { projectId, setProjectId } = useProject()

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <Paper
      sx={{
        p: 4,
        mb: 3,
        borderRadius: 4,
        background: projectId
          ? 'linear-gradient(135deg, #065f46 0%, #047857 45%, #059669 100%)'
          : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #6d28d9 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          top: -100,
          right: -60,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          bottom: -60,
          left: 80,
        }}
      />
      <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            {today}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5 }}>
            {projectId ? 'Dashboard do Projeto' : `Bem-vindo, ${userName}!`}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            {projectId
              ? 'Resumo das estações, enlaces e documentos deste projeto.'
              : 'Visão geral dos seus projetos, estações e enlaces de telecomunicações.'}
          </Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {projectId ? (
            <>
              <Button
                variant="contained"
                sx={{ bgcolor: 'white', color: '#047857', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                onClick={() => navigate(`/projects/${projectId}`)}
              >
                Abrir Projeto
              </Button>
              <Button
                variant="outlined"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}
                onClick={() => setProjectId(null)}
              >
                Limpar Seleção
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ bgcolor: 'white', color: '#312e81', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                onClick={() => navigate('/projects')}
              >
                Novo Projeto
              </Button>
              <Button
                variant="outlined"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}
                onClick={() => navigate(isMaster ? '/finance' : '/tasks')}
              >
                {isMaster ? 'Ver Finanças' : 'Ver Tarefas'}
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Paper>
  )
}
