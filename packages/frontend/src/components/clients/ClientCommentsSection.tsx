import CommentsSection from '../ui/CommentsSection'

interface ClientCommentsSectionProps {
  clientId: number
}

export default function ClientCommentsSection({ clientId }: ClientCommentsSectionProps) {
  return <CommentsSection resource="client" resourceId={clientId} />
}
