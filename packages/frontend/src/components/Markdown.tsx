import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Box } from '@mui/material'

export default function Markdown({ children }: { children?: string | null }) {
  return (
    <Box
      sx={{
        '& p': { m: 0, mb: 1 },
        '& ul, & ol': { m: 0, mb: 1, pl: 3 },
        '& h1, & h2, & h3, & h4, & h5, & h6': { m: 0, mb: 1, fontWeight: 700 },
        '& a': { color: 'primary.main' },
        '& code': { bgcolor: 'rgba(0,0,0,0.06)', px: 0.5, borderRadius: 0.5 },
        '& pre': { bgcolor: 'rgba(0,0,0,0.06)', p: 1, borderRadius: 1, overflowX: 'auto', mb: 1 },
        '& pre code': { bgcolor: 'transparent', p: 0 },
        '& blockquote': { borderLeft: '3px solid rgba(0,0,0,0.2)', pl: 1, ml: 0, color: 'text.secondary' },
        '& table': { borderCollapse: 'collapse', mb: 1 },
        '& th, & td': { border: '1px solid rgba(0,0,0,0.2)', px: 1, py: 0.5 },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children || ''}</ReactMarkdown>
    </Box>
  )
}
