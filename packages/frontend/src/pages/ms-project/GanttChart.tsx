import { Box, Chip, Typography } from '@mui/material'
import { MsDependency, MsTask, dependencyTypeLabels } from './msProjectTypes'

const DAY_WIDTH = 36
const ROW_HEIGHT = 38
const LABEL_WIDTH = 260

const toDate = (value: string) => new Date(`${value}T00:00:00`)

const dayDiff = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000)

const addDays = (date: Date, days: number) => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

const monthShort = (date: Date) =>
  date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')

interface GanttChartProps {
  tasks: MsTask[]
  dependencies: MsDependency[]
}

export default function GanttChart({ tasks, dependencies }: GanttChartProps) {
  const withDates = tasks.filter((t) => t.startDate && t.finishDate)
  if (withDates.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        Nenhuma tarefa com datas calculadas. Adicione tarefas para gerar o cronograma.
      </Typography>
    )
  }

  const first = withDates[0]
  let minDate = toDate(first.startDate!)
  let maxDate = toDate(first.finishDate!)
  for (const task of withDates) {
    const start = toDate(task.startDate!)
    const finish = toDate(task.finishDate!)
    if (start.getTime() < minDate.getTime()) minDate = start
    if (finish.getTime() > maxDate.getTime()) maxDate = finish
  }

  const days: Date[] = []
  let cursor = new Date(minDate)
  while (cursor.getTime() <= maxDate.getTime()) {
    days.push(new Date(cursor))
    cursor = addDays(cursor, 1)
  }

  const rowIndex = new Map(tasks.map((task, index) => [task.id, index]))
  const timeWidth = days.length * DAY_WIDTH
  const totalHeight = tasks.length * ROW_HEIGHT

  const firstDayOfMonth = (index: number) => {
    const day = days[index]
    if (index === 0 || day.getDate() === 1) return monthShort(day)
    return null
  }

  const labelDate = (task: MsTask) => {
    if (task.milestone) return formatShort(task.finishDate)
    return `${formatShort(task.startDate)} – ${formatShort(task.finishDate)}`
  }

  const formatShort = (value: string | null) => {
    if (!value) return '-'
    const [y, m, d] = value.split('-')
    return `${d}/${m}/${y.slice(2)}`
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: LABEL_WIDTH + timeWidth }}>
        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              width: LABEL_WIDTH,
              flexShrink: 0,
              py: 1,
              px: 1,
              borderBottom: '1px solid rgba(0,0,0,0.12)',
              fontWeight: 600,
              fontSize: 12,
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            Tarefa
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              borderBottom: '1px solid rgba(0,0,0,0.12)',
              fontSize: 10,
              textTransform: 'uppercase',
              color: 'text.secondary',
              position: 'relative',
            }}
          >
            {days.map((_, index) => {
              const label = firstDayOfMonth(index)
              if (label === null) return <Box key={index} sx={{ width: DAY_WIDTH, flexShrink: 0 }} />
              const colspan = index === 0 || days[index - 1].getDate() === 1 ? 7 : 1
              return (
                <Box
                  key={index}
                  sx={{
                    width: DAY_WIDTH * colspan,
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {label}
                </Box>
              )
            })}
          </Box>
        </Box>

        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              width: LABEL_WIDTH,
              flexShrink: 0,
              borderBottom: '1px solid rgba(0,0,0,0.12)',
              bgcolor: 'background.paper',
            }}
          >
            {tasks.map((task) => (
              <Box
                key={task.id}
                sx={{ height: ROW_HEIGHT, px: 1, display: 'flex', alignItems: 'center', gap: 0.75, borderBottom: '1px solid rgba(0,0,0,0.06)' }}
              >
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ fontWeight: task.critical ? 700 : 400, color: task.milestone ? 'text.secondary' : 'text.primary' }}
                >
                  {task.milestone ? `◆ ${task.name}` : task.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ ml: 'auto' }}>
                  {labelDate(task)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ position: 'relative', flexGrow: 1, height: totalHeight }}>
            {days.map((day, index) => (
              <Box
                key={index}
                sx={{
                  position: 'absolute',
                  left: index * DAY_WIDTH,
                  top: 0,
                  width: DAY_WIDTH,
                  height: totalHeight,
                  borderLeft: index > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  bgcolor: isWeekend(day) ? 'rgba(0,0,0,0.03)' : 'transparent',
                }}
              />
            ))}

            {tasks.map((task) => {
              const start = task.startDate ? toDate(task.startDate) : minDate
              const finish = task.finishDate ? toDate(task.finishDate) : minDate
              const left = dayDiff(minDate, start) * DAY_WIDTH
              const width = (dayDiff(start, finish) + 1) * DAY_WIDTH
              const top = rowIndex.get(task.id)! * ROW_HEIGHT

              return (
                <Box key={task.id} sx={{ position: 'absolute', top, left: 0, width: timeWidth, height: ROW_HEIGHT }}>
                  {task.milestone ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: left + DAY_WIDTH / 2,
                        top: ROW_HEIGHT / 2,
                        width: 12,
                        height: 12,
                        bgcolor: task.critical ? 'error.main' : 'primary.main',
                        border: '2px solid white',
                        boxShadow: 1,
                        transform: 'translate(-50%, -50%) rotate(45deg)',
                        borderRadius: '2px',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        left,
                        top: ROW_HEIGHT / 2 - 9,
                        width,
                        height: 18,
                        bgcolor: task.critical ? 'error.main' : 'primary.main',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${Math.max(0, Math.min(100, task.percentComplete))}%`,
                          height: '100%',
                          bgcolor: task.critical ? 'error.dark' : 'primary.dark',
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )
            })}

            <svg
              style={{ position: 'absolute', top: 0, left: 0, width: timeWidth, height: totalHeight, pointerEvents: 'none' }}
            >
              <defs>
                <marker id="ganttArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="#90a4ae" />
                </marker>
              </defs>
              {dependencies
                .filter((dep) => rowIndex.has(dep.taskId) && rowIndex.has(dep.predecessorTaskId))
                .map((dep) => {
                  const pred = tasks[rowIndex.get(dep.predecessorTaskId)!]
                  const succ = tasks[rowIndex.get(dep.taskId)!]
                  const predFinish = pred.finishDate ? toDate(pred.finishDate) : minDate
                  const succStart = succ.startDate ? toDate(succ.startDate) : minDate
                  const x1 = dayDiff(minDate, predFinish) * DAY_WIDTH + DAY_WIDTH
                  const y1 = rowIndex.get(pred.id)! * ROW_HEIGHT + ROW_HEIGHT / 2
                  const x2 = dayDiff(minDate, succStart) * DAY_WIDTH
                  const y2 = rowIndex.get(succ.id)! * ROW_HEIGHT + ROW_HEIGHT / 2
                  const midX = (x1 + x2) / 2
                  const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
                  return (
                    <g key={dep.id}>
                      <path d={path} fill="none" stroke="#90a4ae" strokeWidth="1.5" markerEnd="url(#ganttArrow)" />
                      <title>{`${dependencyTypeLabels[dep.type] || dep.type} · lag ${dep.lagDays}d`}</title>
                    </g>
                  )
                })}
            </svg>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1.5, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip size="small" sx={{ bgcolor: 'primary.main', width: 22, height: 10, borderRadius: 0.5 }} />
            <Typography variant="caption" color="text.secondary">Normal</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Chip size="small" sx={{ bgcolor: 'error.main', width: 22, height: 10, borderRadius: 0.5 }} />
            <Typography variant="caption" color="text.secondary">Crítica</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, bgcolor: 'primary.main', transform: 'rotate(45deg)', borderRadius: 0.5 }} />
            <Typography variant="caption" color="text.secondary">Marco</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 18, height: 4, bgcolor: 'grey.400', borderRadius: 1 }} />
            <Typography variant="caption" color="text.secondary">Dependência</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
