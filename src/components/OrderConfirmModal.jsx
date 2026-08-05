import { useState } from 'react'
import { CheckCircle2, Loader2, MessageCircle, Send, X } from 'lucide-react'
import { DAYS, MEAL_SLOTS } from '../data/constants'
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  countDayMeals,
  countTotalMeals,
} from '../utils/orderHelpers'

export default function OrderConfirmModal({
  open,
  onClose,
  client,
  company,
  details,
  dishesById,
  onSubmit,
}) {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const total = countTotalMeals(details)

  if (!open) return null

  const message = buildWhatsAppMessage({
    company,
    userName: client.userName,
    userSector: client.userSector,
    userPhone: client.userPhone,
    details,
    dishesById,
  })

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await onSubmit()
      setDone(true)
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
        await onSubmit()
        setDone(true)
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              Revisar pedido
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {total} viandas · {company?.code} · {client.userName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          {done ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="font-display text-lg font-semibold text-slate-900">
                Pedido registrado
              </p>
              <p className="text-sm text-slate-500">
                Ya podés cerrar o enviarlo por WhatsApp.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-stone-50 px-3 py-2.5 text-sm text-slate-600">
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
                  <div key={day.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="font-semibold text-slate-900">
                      {day.label}{' '}
                      <span className="text-sm font-normal text-slate-500">
                        ({dayTotal})
                      </span>
                    </p>
                    {['lunch', 'dinner'].map((slot) => {
                      const entries = Object.entries(dayDetails?.[slot] || {}).filter(
                        ([, n]) => Number(n) > 0,
                      )
                      if (!entries.length) return null
                      return (
                        <div key={slot} className="mt-2">
                          <p
                            className={`text-xs font-bold uppercase tracking-wide ${
                              slot === 'lunch' ? 'text-amber-700' : 'text-indigo-700'
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

        <div className="safe-pb flex flex-col gap-2 border-t border-slate-100 px-5 py-4">
          {!done && (
            <button
              type="button"
              disabled={submitting || total === 0}
              onClick={handleSubmit}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
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
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
          </button>
          {done && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-stone-100 px-4 text-sm font-semibold text-slate-700 hover:bg-stone-200"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
