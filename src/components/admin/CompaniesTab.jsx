import { useState } from 'react'
import { Building2, Plus, Trash2 } from 'lucide-react'

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200'

export default function CompaniesTab({ companies, onCreate, onDelete }) {
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
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form
        onSubmit={submit}
        className="h-fit rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">Nueva empresa</h3>
        <p className="mt-1 text-sm text-slate-500">
          Luego podrás generar formularios para esta empresa.
        </p>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Código</span>
            <input
              className={`${field} uppercase`}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="LYG"
              maxLength={12}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la empresa"
              required
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        {ok && (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {ok}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar empresa
        </button>
      </form>

      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Empresas</h3>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {companies.length}
          </span>
        </div>

        {!companies.length ? (
          <p className="rounded-lg border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-slate-500">
            Todavía no hay empresas cargadas.
          </p>
        ) : (
          <ul className="space-y-2">
            {companies.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-lg border border-stone-200 px-3 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-slate-600">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{c.code}</p>
                  <p className="truncate text-sm text-slate-500">{c.name}</p>
                </div>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar ${c.code}?`)) onDelete(c.id)
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
