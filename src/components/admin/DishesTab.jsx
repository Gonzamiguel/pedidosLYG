import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

export default function DishesTab({ dishes, onCreate, onDelete }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onCreate({ name })
      setName('')
    } catch (err) {
      setError(err.message || 'Error al crear plato')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form
        onSubmit={submit}
        className="h-fit rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">
          Nuevo plato
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Se agrega al catálogo central disponible para todos los menús.
        </p>

        <div className="mt-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Nombre</span>
            <input
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Milanesa de Ternera con Puré"
            />
          </label>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar plato
        </button>
      </form>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">
            Catálogo
          </h3>
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {dishes.length} platos
          </span>
        </div>

        {!dishes.length ? (
          <p className="rounded-xl border border-dashed border-stone-300 px-4 py-10 text-center text-sm text-slate-500">
            No hay platos. Creá el primero desde el formulario.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {dishes.map((dish) => (
              <li
                key={dish.id}
                className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">{dish.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(dish.id)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                  aria-label={`Eliminar ${dish.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
