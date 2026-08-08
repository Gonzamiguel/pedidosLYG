import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react'
import Header from '../components/Header'
import ClientForm from '../components/ClientForm'
import DayTabs from '../components/DayTabs'
import MenuCard from '../components/MenuCard'
import OrderConfirmModal from '../components/OrderConfirmModal'
import {
  emptyOrderDetails,
  getDayLabel,
  OTHER_DELIVERY_PLACE,
} from '../data/constants'
import { dayIdsInRange } from '../data/formHelpers'
import { useCatalog } from '../hooks/useCatalog'
import { weekLabel, weekRangeText } from '../utils/weekHelpers'
import {
  countTotalMeals,
  setDishCount,
} from '../utils/orderHelpers'

const EMPTY_CLIENT = {
  companyId: '',
  userName: '',
  userSector: '',
  userPhone: '',
  deliveryPlaceId: '',
  deliveryPlaceOther: '',
}

export default function OrderPage() {
  const { formId } = useParams()
  const catalog = useCatalog()
  const [form, setForm] = useState(null)
  const [formLoading, setFormLoading] = useState(true)
  const [client, setClient] = useState(EMPTY_CLIENT)
  const [details, setDetails] = useState(emptyOrderDetails)
  const [activeDay, setActiveDay] = useState('lun')
  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [orderSent, setOrderSent] = useState(false)

  useEffect(() => {
    let alive = true
    setFormLoading(true)
    catalog
      .getFormById(formId)
      .then((f) => {
        if (!alive) return
        setForm(f)
        if (f) {
          const days = dayIdsInRange(f.startDate, f.endDate)
          setActiveDay(days[0] || 'lun')
          setClient((prev) => ({ ...prev, companyId: f.companyId }))
          setDetails(emptyOrderDetails())
          setOrderSent(false)
        }
      })
      .finally(() => {
        if (alive) setFormLoading(false)
      })
    return () => {
      alive = false
    }
  }, [formId]) // eslint-disable-line react-hooks/exhaustive-deps

  const company = catalog.companiesById[form?.companyId]
  const visibleDays = useMemo(
    () => (form ? dayIdsInRange(form.startDate, form.endDate) : []),
    [form],
  )

  const total = useMemo(() => countTotalMeals(details), [details])
  const dayMenu = form?.days?.[activeDay] || { lunch: [], dinner: [] }

  const resolveDeliveryPlace = () => {
    if (client.deliveryPlaceId === OTHER_DELIVERY_PLACE) {
      return (client.deliveryPlaceOther || '').trim()
    }
    const place = catalog.deliveryPlaces.find(
      (p) => p.id === client.deliveryPlaceId,
    )
    return (place?.name || client.userSector || '').trim()
  }

  const validateClient = () => {
    const next = {}
    if (!form || !company) next.companyId = 'Formulario no válido'
    if (form?.status === 'closed') next.week = 'Formulario cerrado'
    if (!client.userName.trim()) next.userName = 'Ingresá tu nombre'
    if (!client.deliveryPlaceId) {
      next.userSector = 'Seleccioná el lugar de entrega'
    } else if (
      client.deliveryPlaceId === OTHER_DELIVERY_PLACE &&
      !client.deliveryPlaceOther.trim()
    ) {
      next.userSector = 'Indicá dónde querés la entrega'
    }
    if (!client.userPhone.trim()) next.userPhone = 'Ingresá un teléfono'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const openConfirm = () => {
    if (orderSent) return
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
    const deliveryPlace = resolveDeliveryPlace()
    await catalog.submitOrder({
      companyId: form.companyId,
      formId: form.id,
      weekStart: form.startDate,
      weekEnd: form.endDate,
      userName: client.userName,
      userSector: deliveryPlace,
      userPhone: client.userPhone,
      totalMeals: total,
      details,
    })
  }

  const lockAfterSubmit = () => {
    setOrderSent(true)
    setConfirmOpen(false)
    setDetails(emptyOrderDetails())
    setClient({
      ...EMPTY_CLIENT,
      companyId: form?.companyId || '',
    })
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const startNewOrder = () => {
    setOrderSent(false)
    setDetails(emptyOrderDetails())
    setClient({
      ...EMPTY_CLIENT,
      companyId: form?.companyId || '',
    })
    setErrors({})
    const days = form ? dayIdsInRange(form.startDate, form.endDate) : []
    setActiveDay(days[0] || 'lun')
  }

  if ((catalog.loading && !form) || formLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-500">
        Cargando formulario…
      </div>
    )
  }

  if (!form || !company) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-slate-500" />
          <h1 className="mt-3 text-xl font-semibold text-slate-900">
            Link no válido
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Este formulario no existe o fue eliminado. Pedile al administrador
            el link correcto.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-bordo-700 px-5 text-sm font-semibold text-white hover:bg-bordo-800"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  if (form.status === 'closed') {
    return (
      <div className="pb-8">
        <Header company={company} />
        <div className="mx-auto max-w-lg px-4 py-12">
          <div className="rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm">
            <CalendarDays className="mx-auto h-10 w-10 text-slate-500" />
            <h1 className="mt-3 text-xl font-semibold text-slate-900">
              Formulario cerrado
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              El período {weekRangeText(form)} ya no admite pedidos.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (orderSent) {
    return (
      <div className="pb-8">
        <Header company={company} />
        <div className="mx-auto max-w-lg px-4 py-12">
          <div className="rounded-xl border border-emerald-200 bg-white p-6 text-center shadow-sm">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="mt-3 text-xl font-semibold text-slate-900">
              Pedido enviado
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Tu pedido ya quedó registrado. No hace falta volver a enviarlo.
            </p>
            <button
              type="button"
              onClick={startNewOrder}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-bordo-700 px-5 text-sm font-semibold text-white hover:bg-bordo-800"
            >
              Hacer otro pedido
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 sm:pb-28">
      <Header company={company} />

      <main className="mx-auto max-w-5xl px-3 py-4 sm:px-4 sm:py-7">
        <div className="space-y-4 sm:space-y-5">
          <section className="rounded-xl border border-stone-200 bg-white px-3.5 py-3.5 shadow-sm sm:px-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <CalendarDays className="h-4 w-4" />
              Período del pedido
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {weekLabel(form)}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {company.code} — {company.name}
            </p>
          </section>

          <ClientForm
            company={company}
            value={client}
            onChange={setClient}
            errors={errors}
            deliveryPlaces={catalog.deliveryPlaces}
          />

          <DayTabs
            activeDay={activeDay}
            onChange={setActiveDay}
            details={details}
            allowedDays={visibleDays}
          />

          <div className="pt-1">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              {getDayLabel(activeDay)}
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              Usá + / − o tipeá la cantidad.
            </p>
          </div>

          <div className="grid gap-3.5 lg:grid-cols-2 lg:gap-4">
            <MenuCard
              slot="lunch"
              dishIds={dayMenu.lunch}
              dishesById={catalog.dishesById}
              quantities={details[activeDay]?.lunch}
              onQuantityChange={(dishId, count) =>
                setDetails((prev) =>
                  setDishCount(prev, activeDay, 'lunch', dishId, count),
                )
              }
            />
            <MenuCard
              slot="dinner"
              dishIds={dayMenu.dinner}
              dishesById={catalog.dishesById}
              quantities={details[activeDay]?.dinner}
              onQuantityChange={(dishId, count) =>
                setDetails((prev) =>
                  setDishCount(prev, activeDay, 'dinner', dishId, count),
                )
              }
            />
          </div>
        </div>
      </main>

      <footer className="safe-pb fixed inset-x-0 bottom-0 z-30 border-t border-slate-200/80 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-slate-700">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">Total</p>
              <p className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                {total}{' '}
                <span className="text-sm font-medium text-slate-600">
                  viandas
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={openConfirm}
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-bordo-700 px-3.5 text-sm font-semibold text-white hover:bg-bordo-800 sm:px-6"
          >
            <span className="sm:hidden">Revisar pedido</span>
            <span className="hidden sm:inline">Revisar y Enviar Pedido</span>
          </button>
        </div>
      </footer>

      <OrderConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onCompleted={lockAfterSubmit}
        client={{
          ...client,
          userSector: resolveDeliveryPlace() || client.userSector,
        }}
        company={company}
        week={form}
        details={details}
        dishesById={catalog.dishesById}
        onSubmit={handleSubmitOrder}
      />
    </div>
  )
}
