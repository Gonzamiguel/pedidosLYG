import { useEffect, useState } from 'react'
import { CheckCircle2, Loader2, MessageCircle, Send, X } from 'lucide-react'
import { DAYS, MEAL_SLOTS } from '../data/constants'
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  countDayMeals,
  countTotalMeals,
} from '../utils/orderHelpers'
import { weekRangeText } from '../utils/weekHelpers'

export default function OrderConfirmModal({
  open,
  onClose,
  client,
  company,
  week,
  details,
  dishesById,
  onSubmit,
}) {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const total = countTotalMeals(details)

  useEffect(() => {
    if (!open) return undefined
    setDone(false)
    setShowSuccess(false)
    setError('')
    setSubmitting(false)

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const message = buildWhatsAppMessage({
    company,
    week,
    userName: client.userName,
    userSector: client.userSector,
    userPhone: client.userPhone,
    details,
    dishesById,
  })

  const markSuccess = () => {
    setDone(true)
    setShowSuccess(true)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onSubmit()
      markSuccess()
    } catch (err) {
      setError(err.message || 'No se pudo guardar el pedido')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWhatsApp = async () => {
    if (!done) {
      try {
        setSubmitting(true)
        setError('')
        await onSubmit()
        markSuccess()
      } catch (err) {
        setError(err.message || 'No se pudo guardar el pedido')
        setSubmitting(false)
        return
      } finally {
        setSubmitting(false)
      }
    }
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-review-title"
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 flex h-[min(92dvh,920px)] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:h-auto sm:max-h-[90dvh] sm:rounded-2xl"
      >
        <div className="shrink-0 border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                id="order-review-title"
                className="text-xl font-semibold text-slate-900"
              >
                Revisar pedido
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {total} viandas · {company?.code} · {client.userName}
              </p>
              {week && (
                <p className="mt-0.5 text-xs font-medium text-slate-600">
                  {weekRangeText(week)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* min-h-0 es clave para que el scroll funcione dentro del flex */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 [-webkit-overflow-scrolling:touch]">
          {done ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-lg font-semibold text-slate-900">
                Pedido enviado con éxito
              </p>
              <p className="text-sm text-slate-500">
                Ya podés cerrar o compartirlo por WhatsApp.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              <div className="rounded-xl bg-stone-50 px-3 py-2.5 text-sm text-slate-600">
                {week && (
                  <p>
                    <strong>Período:</strong> {weekRangeText(week)}
                  </p>
                )}
                <p>
                  <strong>Sector:</strong> {client.userSector}
                </p>
                <p>
                  <strong>Tel:</strong> {client.userPhone}
                </p>
              </div>

              {DAYS.map((day) => {
                const dayDetails = details[day.id]
                const dayTotal = countDayMeals(dayDetails)
                if (!dayTotal) return null
                return (
                  <div
                    key={day.id}
                    className="rounded-xl border border-slate-200 p-3"
                  >
                    <p className="font-semibold text-slate-900">
                      {day.label}{' '}
                      <span className="text-sm font-normal text-slate-500">
                        ({dayTotal})
                      </span>
                    </p>
                    {['lunch', 'dinner'].map((slot) => {
                      const entries = Object.entries(
                        dayDetails?.[slot] || {},
                      ).filter(([, n]) => Number(n) > 0)
                      if (!entries.length) return null
                      return (
                        <div key={slot} className="mt-2">
                          <p
                            className={`text-xs font-bold uppercase tracking-wide ${
                              slot === 'lunch'
                                ? 'text-amber-700'
                                : 'text-indigo-700'
                            }`}
                          >
                            {MEAL_SLOTS[slot].label}
                          </p>
                          <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                            {entries.map(([dishId, count]) => (
                              <li key={dishId}>
                                {count}× {dishesById[dishId]?.name || dishId}
                              </li>
                            ))}
                          </ul>
                          {dayDetails?.notes?.[slot]?.trim() && (
                            <p className="mt-1 text-xs italic text-slate-500">
                              Obs: {dayDetails.notes[slot]}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </p>
          )}
        </div>

        <div className="safe-pb shrink-0 flex flex-col gap-2 border-t border-slate-100 bg-white px-5 py-4">
          {!done && (
            <button
              type="button"
              disabled={submitting || total === 0}
              onClick={handleSubmit}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Enviar pedido
            </button>
          )}
          <button
            type="button"
            disabled={submitting || total === 0}
            onClick={handleWhatsApp}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
          </button>
          {done && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-100 px-4 text-sm font-semibold text-slate-700 hover:bg-stone-200"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Ventana emergente de éxito */}
      {showSuccess && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={(e) => {
            e.stopPropagation()
            setShowSuccess(false)
          }}
          role="presentation"
        >
          <div
            role="alertdialog"
            aria-labelledby="order-success-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm animate-fade-up rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3
              id="order-success-title"
              className="mt-4 text-xl font-semibold text-slate-900"
            >
              ¡Pedido enviado con éxito!
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Tu pedido quedó registrado correctamente.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
