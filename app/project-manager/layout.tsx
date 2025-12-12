import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Project Manager | HumanGlue',
  description: 'AI-powered project management tool with Kanban, Mind Map, Gantt charts and more',
}

export default function ProjectManagerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      {children}
    </div>
  )
}
