import { useMemo, useState } from 'react'
import { Clock, ShoppingBag } from 'lucide-react'
import Header from './components/Header'
import ClientForm from './components/ClientForm'
import DayTabs from './components/DayTabs'
import MenuCard from './components/MenuCard'
import OrderConfirmModal from './components/OrderConfirmModal'
import MasterPanel from './components/MasterPanel'
import { ORDER_DEADLINE, emptyOrderDetails, getDayLabel } from './data/constants'
import { useCatalog } from './hooks/useCatalog'
import {
  countTotalMeals,
  isPastDeadline,
  setDayNote,
  setDishCount,
} from './utils/orderHelpers'

const INITIAL_CLIENT = {
  companyId: '',
  userName: '',
  userSector: '',
  userPhone: '',
}

export default function App() {
  const catalog = useCatalog()
  const [client, setClient] = useState(INITIAL_CLIENT)
  const [details, setDetails] = useState(emptyOrderDetails)
  const [activeDay, setActiveDay] = useState('lun')
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)

  const total = useMemo(() => countTotalMeals(details), [details])
  const company = catalog.companiesById[client.companyId]
  const menu = catalog.getMenuFor(client.companyId, activeDay)
  const pastDeadline = isPastDeadline()

  const validateClient = () => {
    const next = {}
    if (!client.companyId) next.companyId = 'Seleccioná una empresa'
    if (!client.userName.trim()) next.userName = 'Ingresá tu nombre'
    if (!client.userSector.trim()) next.userSector = 'Ingresá el sector'
    if (!client.userPhone.trim()) next.userPhone = 'Ingresá un teléfono'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const openConfirm = () => {
    if (!validateClient()) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (total === 0) {
      setErrors({ companyId: errors.companyId })
      alert('Agregá al menos una vianda antes de enviar.')
      return
    }
    setConfirmOpen(true)
  }

  const handleSubmitOrder = async () => {
    await catalog.submitOrder({
      companyId: client.companyId,
      userName: client.userName,
      userSector: client.userSector,
      userPhone: client.userPhone,
      totalMeals: total,
      details,
    })
  }

  const resetAfterClose = () => {
    setConfirmOpen(false)
  }

  return (
    <div className="pb-28">
      <Header onOpenAdmin={() => setAdminOpen(true)} />

      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-7">
        {catalog.loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-16 text-center text-slate-500">
            Cargando catálogo…
          </div>
        ) : catalog.error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-center text-rose-700">
            {catalog.error}
          </div>
        ) : (
          <div className="space-y-5">
            <section className="animate-fade-up">
              <p className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                ViandApp
              </p>
              <p className="mt-1 max-w-xl text-slate-600">
                Pedí almuerzo y cena de lunes a domingo para tu empresa. Simple,
                rápido y pensado para el celular.
              </p>
              <div
                className={`mt-3 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                  pastDeadline
                    ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                    : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                }`}
              >
                <Clock className="h-4 w-4" />
                Horario límite de envío: {ORDER_DEADLINE.label}
              </div>
            </section>

            <ClientForm
              companies={catalog.companies}
              value={client}
              onChange={setClient}
              errors={errors}
            />

            {!client.companyId ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-10 text-center text-slate-500">
                Seleccioná tu empresa para ver el menú semanal.
              </div>
            ) : (
              <>
                <DayTabs
                  activeDay={activeDay}
                  onChange={setActiveDay}
                  details={details}
                />

                <div className="pt-1">
                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    Menú · {getDayLabel(activeDay)}
                  </h2>
                  <p className="text-sm text-slate-500">
                    Elegí cantidades con + / − o tipeá el número directamente.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <MenuCard
                    slot="lunch"
                    dishIds={menu.lunch}
                    dishesById={catalog.dishesById}
                    quantities={details[activeDay]?.lunch}
                    note={details[activeDay]?.notes?.lunch || ''}
                    onQuantityChange={(dishId, count) =>
                      setDetails((prev) =>
                        setDishCount(prev, activeDay, 'lunch', dishId, count),
                      )
                    }
                    onNoteChange={(note) =>
                      setDetails((prev) =>
                        setDayNote(prev, activeDay, 'lunch', note),
                      )
                    }
                  />
                  <MenuCard
                    slot="dinner"
                    dishIds={menu.dinner}
                    dishesById={catalog.dishesById}
                    quantities={details[activeDay]?.dinner}
                    note={details[activeDay]?.notes?.dinner || ''}
                    onQuantityChange={(dishId, count) =>
                      setDetails((prev) =>
                        setDishCount(prev, activeDay, 'dinner', dishId, count),
                      )
                    }
                    onNoteChange={(note) =>
                      setDetails((prev) =>
                        setDayNote(prev, activeDay, 'dinner', note),
                      )
                    }
                  />
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Sticky footer resumen */}
      <footer className="safe-pb fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Total semanal</p>
              <p className="truncate font-display text-lg font-bold text-slate-900">
                {total}{' '}
                <span className="text-base font-semibold text-slate-600">
                  viandas
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openConfirm}
            disabled={!client.companyId}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
          >
            Revisar y Enviar Pedido
          </button>
        </div>
      </footer>

      <OrderConfirmModal
        open={confirmOpen}
        onClose={resetAfterClose}
        client={client}
        company={company}
        details={details}
        dishesById={catalog.dishesById}
        onSubmit={handleSubmitOrder}
      />

      <MasterPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        catalog={catalog}
      />
    </div>
  )
}
