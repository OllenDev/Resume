export type CompanyId = 'salesforce' | 'strava' | 'lowes' | 'consulting'

export type Company = {
  id: CompanyId
  name: string
  title: string
  dates: string
  bullets: string[]
  tech: string[]
}

export const companies: Record<CompanyId, Company> = {
  salesforce: {
    id: 'salesforce',
    name: 'Salesforce',
    title: 'Lead Member of Technical Staff (Android)',
    dates: '2020 – Present',
    bullets: [
      'Agentforce SDK + Field Service mobile foundation',
      'AI Copilot / Pre-work summary features',
      'Architectural leadership across mobile platform',
    ],
    tech: ['Kotlin', 'Android', 'Compose', 'LLMs'],
  },
  strava: {
    id: 'strava',
    name: 'Strava',
    title: 'Senior Software Engineer (Android)',
    dates: '—',
    bullets: ['Challenges, Clubs, partner integrations', 'High stability focus (crash-free)'],
    tech: ['Kotlin', 'Android'],
  },
  lowes: {
    id: 'lowes',
    name: "Lowe’s",
    title: 'Android Tech Lead',
    dates: '—',
    bullets: ['Tech lead for early flagship Android app', 'Shipped core retail experiences'],
    tech: ['Android', 'Java/Kotlin'],
  },
  consulting: {
    id: 'consulting',
    name: 'Consulting',
    title: 'Principal / Mobile Lead',
    dates: '—',
    bullets: ['Led mobile teams across client projects', 'Architecture + delivery'],
    tech: ['iOS', 'Android', 'Leadership'],
  },
}
