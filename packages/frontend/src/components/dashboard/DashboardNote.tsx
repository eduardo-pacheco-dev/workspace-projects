import { useState, useEffect, useRef } from 'react'
import { Box, Paper, TextareaAutosize } from '@mui/material'
import api from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardNote() {
  const { user } = useAuth()
  const [text, setText] = useState('')
  const timerRef = useRef<number | null>(null)
  const userId = user?.id

  useEffect(() => {
    let cancelled = false
    if (userId != null) {
      api
        .get('/dashboard-notes/me')
        .then((res) => {
          if (!cancelled) setText(res.data?.content ?? '')
        })
        .catch(() => {})
    }
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const handleChange = (value: string) => {
    setText(value)
    if (userId == null) return
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      api.put('/dashboard-notes/me', { content: value }).catch(() => {})
    }, 500)
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: 2,
        pt: 2.5,
        borderRadius: 1,
        bgcolor: '#fff9c4',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        transform: 'rotate(-0.5deg)',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: -9,
          left: '50%',
          transform: 'translateX(-50%) rotate(-2deg)',
          width: 90,
          height: 22,
          bgcolor: 'rgba(255,255,255,0.6)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        }}
      />
      <TextareaAutosize
        minRows={4}
        maxRows={14}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Escreva seu rascunho..."
        style={{
          width: '100%',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          resize: 'vertical',
          fontFamily: 'inherit',
          fontSize: '0.95rem',
          lineHeight: 1.5,
          color: 'rgba(0,0,0,0.8)',
        }}
      />
    </Paper>
  )
}
