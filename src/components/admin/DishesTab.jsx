import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { DISH_TAGS } from '../../data/constants'

export default function DishesTab({ dishes, onCreate, onDelete }) {
  const [form, setForm] = useState({
    name: '',
    tag: DISH_TAGS[0],
    desc: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onCreate(form)
      setForm({ name: '', tag: DISH_TAGS[0], desc: '' })
    } catch (err) {
      setError(err.message || 'Error al crear plato')
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
        <h3 className="text-sm font-semibold text-amber-400">Nuevo plato</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-xs text-slate-400">Nombre</span>
            <input
              className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none focus:border-amber-400"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej: Milanesa de Ternera con Puré"
            />
          </label>
          <label className="block">
            <span className="text-xs text-slate-400">Etiqueta</span>
            <select
              className="mt-1 w-full min-h-11 rounded-lg border border-slate-600 bg-slate-900 px-3 text-sm text-white outline-none focus:border-amber-400"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
            >
              {DISH_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs text-slate-400">Descripción / guarnición</span>
            <textarea
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              placeholder="Opciones de guarnición u observaciones"
            />
          </label>
        </div>
        {error && <p className="mt-2 text-xs text-rose-400">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-500 px-4 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Agregar plato
        </button>
      </form>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-300">
          Catálogo ({dishes.length})
        </h3>
        <ul className="space-y-2">
          {dishes.map((dish) => (
            <li
              key={dish.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-3"
            >
              <div>
                <p className="font-medium text-white">{dish.name}</p>
                <p className="text-xs text-amber-400/90">{dish.tag}</p>
                {dish.desc && (
                  <p className="mt-1 text-xs text-slate-400">{dish.desc}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDelete(dish.id)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                aria-label={`Eliminar ${dish.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
