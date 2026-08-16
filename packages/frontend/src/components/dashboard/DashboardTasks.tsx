import { useState, useEffect } from 'react'
import { Divider, List, ListItem, ListItemText, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { normalizeList } from '../../utils/list'

interface TaskItem {
  id: number
  title: string
  status: string
  dueAt?: string | null
  assignedTo?: string | null
}

export default function DashboardTasks() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<TaskItem[]>([])

  useEffect(() => {
    let cancelled = false
    api
      .get('/tasks', { params: { limit: 100, sortBy: 'dueAt', sortOrder: 'ASC' } })
      .then((res) => {
        if (cancelled) return
        const data = normalizeList<TaskItem>(res.data).data
        const mine = user?.name ? data.filter((t) => t.assignedTo === user.name) : []
        setTasks(mine)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user?.name])

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid rgba(0,0,0,0.08)',
        bgcolor: 'background.paper',
        height: '100%',
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'rgb(0, 21, 68)' }}>
        Minhas Tarefas
      </Typography>
      <Divider sx={{ my: 1.5 }} />
      {tasks.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Nenhuma tarefa atribuída a você.
        </Typography>
      ) : (
        <List dense disablePadding>
          {tasks.slice(0, 8).map((task) => {
            const done = task.status === 'completed'
            return (
              <ListItem
                key={task.id}
                sx={{ px: 0, py: 0.25, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'rgba(0, 21, 68, 0.04)' } }}
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <ListItemText
                  primary={task.title}
                  secondary={task.dueAt ? new Date(task.dueAt).toLocaleDateString('pt-BR') : ''}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: done ? 'line-through' : 'none',
                      color: done ? 'text.secondary' : 'inherit',
                    },
                  }}
                  secondaryTypographyProps={{ sx: { fontSize: '0.75rem' } }}
                />
              </ListItem>
            )
          })}
        </List>
      )}
    </Paper>
  )
}
