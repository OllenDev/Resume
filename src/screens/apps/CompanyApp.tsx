import { useParams } from 'react-router-dom'
import { companies } from '../../data/companies'

export default function CompanyApp() {
  const { id } = useParams()
  const c = (id && (companies as any)[id]) ? (companies as any)[id] : null

  if (!c) return <div className="pad">Unknown company.</div>

  return (
    <div className="pad">
      <h2 className="h2">{c.name}</h2>
      <div className="muted">{c.title}</div>
      <div className="muted">{c.dates}</div>

      <div className="spacer" />
      <ul className="bullets">
        {c.bullets.map((b: string) => <li key={b}>{b}</li>)}
      </ul>

      <div className="spacer" />
      <div className="chips">
        {c.tech.map((t: string) => <span key={t} className="chip">{t}</span>)}
      </div>
    </div>
  )
}
