import { useState } from 'react'
import { Building2, Check, Copy, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { companyOrderPath, companyOrderUrl } from '../../utils/companyLinks'

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

export default function CompaniesTab({ companies, onCreate, onDelete }) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [copiedId, setCopiedId] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    setOk('')
    try {
      const created = await onCreate({ code, name })
      setCode('')
      setName('')
      setOk(
        created?.id
          ? `Empresa creada. Link: ${companyOrderPath(created.id)}`
          : 'Empresa creada correctamente',
      )
    } catch (err) {
      setError(err.message || 'Error al crear empresa')
    } finally {
      setBusy(false)
    }
  }

  const copyLink = async (company) => {
    const url = companyOrderUrl(company.id)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(company.id)
      setTimeout(() => setCopiedId(''), 2000)
    } catch {
      window.prompt('Copiá este link:', url)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form
        onSubmit={submit}
        className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">
          Nueva empresa
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Al crearla se genera un link único para enviar a esa empresa.
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
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar empresa
        </button>
      </form>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Empresas y links
            </h3>
            <p className="text-sm text-slate-500">
              Copiá el link y enviáselo a cada empresa.
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {companies.length}
          </span>
        </div>

        {!companies.length ? (
          <p className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-slate-500">
            Todavía no hay empresas. Creá la primera para generar su link.
          </p>
        ) : (
          <ul className="space-y-3">
            {companies.map((c) => {
              const path = companyOrderPath(c.id)
              const url = companyOrderUrl(c.id)
              const copied = copiedId === c.id
              return (
                <li
                  key={c.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/80 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{c.code}</p>
                      <p className="truncate text-sm text-slate-500">{c.name}</p>
                      <p className="mt-2 truncate rounded-lg bg-white px-2.5 py-1.5 font-mono text-xs text-slate-600 ring-1 ring-stone-200">
                        {url}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyLink(c)}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-white hover:bg-amber-600"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? 'Copiado' : 'Copiar link'}
                    </button>
                    <a
                      href={path}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-700 ring-1 ring-stone-200 hover:bg-stone-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Abrir formulario
                    </a>
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `¿Eliminar ${c.code}? También se borran sus menús.`,
                            )
                          ) {
                            onDelete(c.id)
                          }
                        }}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
