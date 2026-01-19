import { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AppFrame({ title, children }: { title: string; children: ReactNode }) {
  const nav = useNavigate()
  return (
    <div className="app">
      <div className="appbar">
        <button className="back" onClick={() => nav(-1)}>⬅</button>
        <div className="title">{title}</div>
      </div>
      <div className="appcontent">{children}</div>
    </div>
  )
}
