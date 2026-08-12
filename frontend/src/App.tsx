import { Link, Route, Routes } from 'react-router-dom'

function DashboardPlaceholder() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-sky-400">SERVER CONTROL CENTER</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-slate-400">Foundation ready. The production dashboard will be migrated from the Figma prototype next.</p>
        <nav className="mt-8 flex gap-3">
          <Link className="rounded-lg border border-slate-800 px-4 py-2 text-sm hover:bg-slate-900" to="/containers">Containers</Link>
        </nav>
      </div>
    </main>
  )
}

function ContainersPlaceholder() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <Link className="text-sm text-sky-400 hover:text-sky-300" to="/">← Dashboard</Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Containers</h1>
        <p className="mt-2 text-slate-400">Docker management will be implemented here.</p>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPlaceholder />} />
      <Route path="/containers" element={<ContainersPlaceholder />} />
    </Routes>
  )
}
