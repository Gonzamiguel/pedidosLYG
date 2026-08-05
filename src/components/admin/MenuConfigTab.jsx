import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { DAYS, MAX_DISHES_PER_SLOT } from '../../data/constants'

const field =
  'mt-1.5 w-full min-h-11 rounded-lg border border-stone-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200'

export default function MenuConfigTab({
  companies,
  dishes,
  getMenuFor,
  onSave,
}) {
  const [companyId, setCompanyId] = useState(companies[0]?.id || '')
  const [dayId, setDayId] = useState('lun')
  const [lunch, setLunch] = useState([])
  const [dinner, setDinner] = useState([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (!companyId && companies[0]) setCompanyId(companies[0].id)
  }, [companies, companyId])

  useEffect(() => {
    if (!companyId) return
    const menu = getMenuFor(companyId, dayId)
    setLunch(menu.lunch || [])
    setDinner(menu.dinner || [])
    setMsg('')
  }, [companyId, dayId, getMenuFor])

  const toggle = (slot, dishId) => {
    const setter = slot === 'lunch' ? setLunch : setDinner
    const current = slot === 'lunch' ? lunch : dinner
    if (current.includes(dishId)) {
      setter(current.filter((id) => id !== dishId))
      return
    }
    if (current.length >= MAX_DISHES_PER_SLOT) {
      setMsg(`Máximo ${MAX_DISHES_PER_SLOT} platos por turno`)
      return
    }
    setter([...current, dishId])
    setMsg('')
  }

  const save = async () => {
    if (!companyId) return
    setBusy(true)
    setMsg('')
    try {
      await onSave({ companyId, dayId, lunch, dinner })
      setMsg('Menú guardado')
    } catch (err) {
      setMsg(err.message || 'Error al guardar')
    } finally {
      setBusy(false)
    }
  }

  const SlotPicker = ({ title, slot, selected, tone }) => (
    <div
      className={`rounded-2xl border p-4 ${
        tone === 'lunch'
          ? 'border-amber-200 bg-amber-50/50'
          : 'border-indigo-200 bg-indigo-50/50'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4
          className={`font-display text-base font-semibold ${
            tone === 'lunch' ? 'text-amber-800' : 'text-indigo-800'
          }`}
        >
          {title}
        </h4>
        <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-stone-200">
          {selected.length}/{MAX_DISHES_PER_SLOT}
        </span>
      </div>
      <ul className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
        {dishes.map((dish) => {
          const checked = selected.includes(dish.id)
          return (
            <li key={dish.id}>
              <label
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                  checked
                    ? 'bg-white shadow-sm ring-1 ring-amber-300'
                    : 'bg-white/60 hover:bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(slot, dish.id)}
                  className="h-4 w-4 accent-amber-600"
                />
                <span className="text-sm text-slate-800">
                  {dish.name}
                  <span className="ml-2 text-xs text-slate-400">{dish.tag}</span>
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Empresa</span>
            <select
              className={field}
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Día</span>
            <select
              className={field}
              value={dayId}
              onChange={(e) => setDayId(e.target.value)}
            >
              {DAYS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy || !companyId}
            onClick={save}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-amber-500 px-5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            Guardar menú
          </button>
          {msg && (
            <p
              className={`text-sm ${
                msg.includes('Error') || msg.includes('Máximo')
                  ? 'text-rose-600'
                  : 'text-emerald-700'
              }`}
            >
              {msg}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SlotPicker title="Almuerzo" slot="lunch" selected={lunch} tone="lunch" />
        <SlotPicker title="Cena" slot="dinner" selected={dinner} tone="dinner" />
      </div>
    </div>
  )
}
