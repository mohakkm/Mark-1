export type LeadStatus =
  | 'interested'
  | 'replied'
  | 'messaged'
  | 'no-reply'
  | 'passed'

export type Lead = {
  id: string
  name: string
  role: string
  company: string
  status: LeadStatus
  lastTouch: string
}

export type RankedItem = {
  label: string
  count: number
}

export type Idea = {
  id: string
  name: string
  tagline: string
  metrics: {
    totalLeads: number
    messaged: number
    replied: number
    interested: number
  }
  painPoints: RankedItem[]
  objections: RankedItem[]
  leads: Lead[]
}

export const statusMeta: Record<
  LeadStatus,
  { label: string; tone: 'positive' | 'warn' | 'neutral' | 'primary' }
> = {
  interested: { label: 'Interested', tone: 'positive' },
  replied: { label: 'Replied', tone: 'primary' },
  messaged: { label: 'Messaged', tone: 'warn' },
  'no-reply': { label: 'No reply', tone: 'neutral' },
  passed: { label: 'Passed', tone: 'neutral' },
}

export type LeadWithIdea = {
  lead: Lead
  idea: Idea
}

export function findLead(id: string): LeadWithIdea | undefined {
  for (const idea of ideas) {
    const lead = idea.leads.find((l) => l.id === id)
    if (lead) return { lead, idea }
  }
  return undefined
}

export const ideas: Idea[] = [
  {
    id: 'ops-copilot',
    name: 'Ops Copilot',
    tagline: 'AI runbook automation for on-call SRE teams',
    metrics: { totalLeads: 30, messaged: 30, replied: 12, interested: 5 },
    painPoints: [
      { label: 'Manual incident triage eats hours', count: 14 },
      { label: 'Runbooks go stale, nobody trusts them', count: 11 },
      { label: 'Context scattered across tools', count: 9 },
      { label: 'On-call burnout / handoff gaps', count: 7 },
      { label: 'Postmortems never get automated', count: 4 },
    ],
    objections: [
      { label: 'Security review would be brutal', count: 8 },
      { label: 'Already built something internal', count: 6 },
      { label: 'Not enough incident volume', count: 5 },
      { label: 'Budget frozen this quarter', count: 3 },
    ],
    leads: [
      { id: 'l1', name: 'Priya Nair', role: 'Eng Manager', company: 'Cursorly', status: 'interested', lastTouch: '2d ago' },
      { id: 'l2', name: 'Marcus Feld', role: 'Head of SRE', company: 'Northwind', status: 'interested', lastTouch: '3d ago' },
      { id: 'l3', name: 'Dana Cho', role: 'VP Eng', company: 'Loomstack', status: 'replied', lastTouch: '1d ago' },
      { id: 'l4', name: 'Tobias Re-', role: 'Platform Lead', company: 'Habitat', status: 'replied', lastTouch: '4d ago' },
      { id: 'l5', name: 'Elena Sorokina', role: 'CTO', company: 'Fernpath', status: 'messaged', lastTouch: '5d ago' },
      { id: 'l6', name: 'Sam Okafor', role: 'DevOps', company: 'Brightmill', status: 'no-reply', lastTouch: '8d ago' },
      { id: 'l7', name: 'Wei Zhang', role: 'Eng Director', company: 'Cadence', status: 'interested', lastTouch: '2d ago' },
      { id: 'l8', name: 'Rafael Duarte', role: 'SRE', company: 'Junco', status: 'passed', lastTouch: '6d ago' },
      { id: 'l9', name: 'Hana Bergström', role: 'Head of Infra', company: 'Vellum', status: 'replied', lastTouch: '3d ago' },
      { id: 'l10', name: 'Omar Haddad', role: 'VP Platform', company: 'Skyloom', status: 'messaged', lastTouch: '7d ago' },
    ],
  },
  {
    id: 'churn-radar',
    name: 'Churn Radar',
    tagline: 'Early-warning signals for B2B SaaS retention teams',
    metrics: { totalLeads: 24, messaged: 22, replied: 7, interested: 3 },
    painPoints: [
      { label: 'Churn shows up too late to save', count: 10 },
      { label: 'CS teams fly blind between QBRs', count: 8 },
      { label: 'Usage data trapped in the warehouse', count: 6 },
      { label: 'No shared definition of "at risk"', count: 5 },
    ],
    objections: [
      { label: 'We have a data team for this', count: 7 },
      { label: 'Integrations look like heavy lift', count: 5 },
      { label: 'Skeptical of predictive scores', count: 4 },
    ],
    leads: [
      { id: 'c1', name: 'Grace Lin', role: 'VP Success', company: 'Payload', status: 'interested', lastTouch: '1d ago' },
      { id: 'c2', name: 'Nate Ellison', role: 'Head of CS', company: 'Orbital', status: 'replied', lastTouch: '2d ago' },
      { id: 'c3', name: 'Sofia Marín', role: 'RevOps', company: 'Tandem', status: 'messaged', lastTouch: '4d ago' },
      { id: 'c4', name: 'Kenji Watanabe', role: 'COO', company: 'Fibre', status: 'no-reply', lastTouch: '9d ago' },
      { id: 'c5', name: 'Aisha Bello', role: 'CS Ops', company: 'Meridian', status: 'interested', lastTouch: '3d ago' },
      { id: 'c6', name: 'Leo Fischer', role: 'VP Success', company: 'Kettle', status: 'passed', lastTouch: '5d ago' },
    ],
  },
  {
    id: 'briefly',
    name: 'Briefly',
    tagline: 'Async standups that write themselves from your commits',
    metrics: { totalLeads: 18, messaged: 15, replied: 4, interested: 1 },
    painPoints: [
      { label: 'Standups waste synchronous time', count: 7 },
      { label: 'Status updates are copy-paste noise', count: 5 },
      { label: 'Managers lack real progress signal', count: 4 },
    ],
    objections: [
      { label: 'Team already ditched standups', count: 6 },
      { label: 'Privacy concerns on commit reads', count: 4 },
      { label: 'Yet another Slack bot', count: 3 },
    ],
    leads: [
      { id: 'b1', name: 'Ivy Delgado', role: 'Eng Manager', company: 'Postscript', status: 'interested', lastTouch: '2d ago' },
      { id: 'b2', name: 'Rohan Mehta', role: 'Team Lead', company: 'Glasshouse', status: 'replied', lastTouch: '3d ago' },
      { id: 'b3', name: 'Freya Olsen', role: 'VP Eng', company: 'Marrow', status: 'messaged', lastTouch: '6d ago' },
      { id: 'b4', name: 'Diego Ramos', role: 'CTO', company: 'Uplink', status: 'no-reply', lastTouch: '10d ago' },
    ],
  },
]
