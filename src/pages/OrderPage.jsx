import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ShoppingBag } from 'lucide-react'
import Header from '../components/Header'
import ClientForm from '../components/ClientForm'
import DayTabs from '../components/DayTabs'
import MenuCard from '../components/MenuCard'
import OrderConfirmModal from '../components/OrderConfirmModal'
import { emptyOrderDetails, getDayLabel } from '../data/constants'
import { useCatalog } from '../hooks/useCatalog'
import { findCompanyBySlug } from '../utils/companyLinks'
import {
  countTotalMeals,
  setDayNote,
  setDishCount,
} from '../utils/orderHelpers'

const EMPTY_CLIENT = {
  companyId: '',
  userName: '',
  userSector: '',
  userPhone: '',
}

export default function OrderPage() {
  const { companySlug } = useParams()
  const catalog = useCatalog()
  const [client, setClient] = useState(EMPTY_CLIENT)
  const [details, setDetails] = useState(emptyOrderDetails)
  const [activeDay, setActiveDay] = useState('lun')
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const company = useMemo(
    () => findCompanyBySlug(catalog.companies, companySlug),
    [catalog.companies, companySlug],
  )

  useEffect(() => {
    if (!company) return
    setClient((prev) => ({ ...prev, companyId: company.id }))
    setDetails(emptyOrderDetails())
    setActiveDay('lun')
    setErrors({})
  }, [company?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const total = useMemo(() => countTotalMeals(details), [details])
  const menu = catalog.getMenuFor(company?.id || '', activeDay)

  const validateClient = () => {
    const next = {}
    if (!company) next.companyId = 'Empresa no encontrada'
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
      alert('Agregá al menos una vianda antes de enviar.')
      return
    }
    setConfirmOpen(true)
  }

  const handleSubmitOrder = async () => {
    await catalog.submitOrder({
      companyId: company.id,
      userName: client.userName,
      userSector: client.userSector,
      userPhone: client.userPhone,
      totalMeals: total,
      details,
    })
  }

  if (catalog.loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-500">
        Cargando menú…
      </div>
    )
  }

  if (catalog.error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-8 text-sm text-rose-700">
          {catalog.error}
        </p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />
          <h1 className="mt-3 font-display text-xl font-bold text-slate-900">
            Link no válido
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            No encontramos la empresa{' '}
            <code className="rounded bg-stone-100 px-1">{companySlug}</code>.
            Pedile al administrador el link correcto.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-500 px-5 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 sm:pb-28">
      <Header company={company} />

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-7">
        <div className="space-y-4 sm:space-y-5">
          <section className="animate-fade-up">
            <p className="text-sm font-medium text-slate-600 sm:text-base">
              Pedí almuerzo y cena de lunes a domingo para{' '}
              <span className="font-semibold text-slate-900">{company.code}</span>.
            </p>
          </section>

          <ClientForm
            company={company}
            value={client}
            onChange={setClient}
            errors={errors}
          />

          <DayTabs
            activeDay={activeDay}
            onChange={setActiveDay}
            details={details}
          />

          <div className="pt-1">
            <h2 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
              {getDayLabel(activeDay)}
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              Usá + / − o tipeá la cantidad.
            </p>
          </div>

          <div className="grid gap-3.5 lg:grid-cols-2 lg:gap-4">
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
                setDetails((prev) => setDayNote(prev, activeDay, 'lunch', note))
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
                setDetails((prev) => setDayNote(prev, activeDay, 'dinner', note))
              }
            />
          </div>
        </div>
      </main>

      <footer className="safe-pb fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">Total semana</p>
              <p className="truncate font-display text-base font-bold text-slate-900 sm:text-lg">
                {total}{' '}
                <span className="text-sm font-semibold text-slate-600">
                  viandas
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openConfirm}
            className="inline-flex h-12 min-w-0 shrink-0 items-center justify-center rounded-xl bg-slate-900 px-3.5 text-sm font-semibold text-white transition active:scale-[0.98] hover:bg-slate-800 sm:px-6"
          >
            <span className="sm:hidden">Revisar pedido</span>
            <span className="hidden sm:inline">Revisar y Enviar Pedido</span>
          </button>
        </div>
      </footer>

      <OrderConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        client={client}
        company={company}
        details={details}
        dishesById={catalog.dishesById}
        onSubmit={handleSubmitOrder}
      />
    </div>
  )
}
