export function formOrderPath(formId) {
  return `/pedido/${encodeURIComponent(formId)}`
}

export function formOrderUrl(formId, origin = window.location.origin) {
  return `${origin}${formOrderPath(formId)}`
}
