import { useState } from 'react'
import { Building2, Plus } from 'lucide-react'

export default function CompaniesTab({ companies, onCreate }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setOk('')
    try {
      await onCreate({ code, name })
      setCode('')
      setName('')
      setOk('Empresa creada correctamente')
    } catch (err) {
      setError(err.message || 'Error al crear empresa')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="rounded-xl border border-slate-700 bg-slate-800/60 p-4"
      >
        <h3 className="text-sm font-semibold text-amber-400">Nueva empresa</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-slate-400">Código</span>
            <input
              className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm uppercase text-white outline-none focus:border-amber-400"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="LYG"
              maxLength={12}
              required
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Nombre</span>
            <input
              className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none focus:border-amber-400"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="LYG Servicios Industriales"
              required
            />
          </label>
        </div>
        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        {ok && <p className="mt-2 text-xs text-emerald-400">{ok}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar empresa
        </button>
      </form>

      <ul className="space-y-2">
        {companies.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">{c.code}</p>
              <p className="text-sm text-slate-400">{c.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
