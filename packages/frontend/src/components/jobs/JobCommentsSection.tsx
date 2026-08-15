import CommentsSection from '../ui/CommentsSection'

interface JobCommentsSectionProps {
  jobId: number
}

export default function JobCommentsSection({ jobId }: JobCommentsSectionProps) {
  return <CommentsSection resource="job" resourceId={jobId} />
}
