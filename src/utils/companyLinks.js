/** Path del formulario de pedidos de una empresa */
export function companyOrderPath(companyId) {
  return `/pedido/${encodeURIComponent(companyId)}`
}

/** URL absoluta para compartir con la empresa */
export function companyOrderUrl(companyId, origin = window.location.origin) {
  return `${origin}${companyOrderPath(companyId)}`
}

/** Busca empresa por id o código (case-insensitive) */
export function findCompanyBySlug(companies, slug) {
  if (!slug) return null
  const key = decodeURIComponent(slug).trim().toLowerCase()
  return (
    companies.find((c) => c.id === key) ||
    companies.find((c) => c.code?.toLowerCase() === key) ||
    null
  )
}
