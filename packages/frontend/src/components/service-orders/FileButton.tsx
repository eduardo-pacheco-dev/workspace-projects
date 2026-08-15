import { useRef } from 'react'
import { Button, IconButton } from '@mui/material'
import { AttachFile, Delete } from '@mui/icons-material'

interface FileButtonProps {
  file: File | null
  existingName?: string | null
  onFileChange: (file: File | null) => void
}

export default function FileButton({ file, existingName, onFileChange }: FileButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const label = file ? file.name : (existingName || 'Anexar arquivo')

  const clear = () => {
    onFileChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<AttachFile />}
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </Button>
      {(file || existingName) && (
        <IconButton size="small" onClick={clear}>
          <Delete fontSize="small" />
        </IconButton>
      )}
      <input ref={inputRef} type="file" hidden onChange={(e) => onFileChange(e.target.files?.[0] || null)} />
    </>
  )
}
