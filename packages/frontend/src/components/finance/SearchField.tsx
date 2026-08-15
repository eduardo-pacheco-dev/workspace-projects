import SearchInput from '../ui/SearchInput'

interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
  minWidth?: number
}

export default function SearchField({ value, onChange, minWidth }: SearchFieldProps) {
  return <SearchInput value={value} onChange={onChange} minWidth={minWidth} />
}
