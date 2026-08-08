import { notFound } from 'next/navigation'
import { findLead } from '@/lib/data'
import { LeadDetail } from '@/components/lead-detail'

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = findLead(id)
  if (!data) notFound()
  return <LeadDetail data={data} />
}
