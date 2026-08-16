import { Box, Paper, Stack, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
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
        height: '33.33vh',
        minHeight: 260,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 4,
        borderRadius: 0,
        mx: -3,
        mt: -3,
        background: projectId
          ? 'linear-gradient(135deg, rgba(6, 95, 70, 0.78) 0%, rgba(4, 120, 87, 0.7) 45%, rgba(5, 150, 105, 0.5) 100%), url("https://images.pexels.com/photos/17869674/pexels-photo-17869674/free-photo-of-cidade-meio-urbano-conexao-ligacao.jpeg") center/cover no-repeat'
          : 'linear-gradient(135deg, rgba(0, 21, 68, 0.78) 0%, rgba(30, 58, 138, 0.68) 55%, rgba(59, 91, 219, 0.5) 100%), url("https://images.pexels.com/photos/17869674/pexels-photo-17869674/free-photo-of-cidade-meio-urbano-conexao-ligacao.jpeg") center/cover no-repeat',
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
                sx={{ bgcolor: 'white', color: 'rgb(0, 21, 68)', fontWeight: 600, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
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
