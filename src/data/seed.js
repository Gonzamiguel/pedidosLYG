import { DAY_IDS } from './constants'

/** Empresas de prueba */
export const SEED_COMPANIES = [
  {
    id: 'lyg',
    code: 'LYG',
    name: 'LYG Servicios Industriales',
  },
  {
    id: 'gyl',
    code: 'GYL',
    name: 'GYL Logística y Transporte',
  },
]

/** 10 platos del catálogo central */
export const SEED_DISHES = [
  {
    id: 'milanesa-pure',
    name: 'Milanesa de Ternera con Puré',
    tag: 'Tradicional',
    desc: 'Milanesa al horno con puré de papas. Opción: ensalada mixta.',
  },
  {
    id: 'pollo-grillado',
    name: 'Pollo Grillado con Ensalada',
    tag: 'Saludable / Veggie',
    desc: 'Suprema grillada, ensalada fresca y arroz integral.',
  },
  {
    id: 'guiso-lentejas',
    name: 'Guiso de Lentejas',
    tag: 'Tradicional',
    desc: 'Guiso casero con verduras de estación.',
  },
  {
    id: 'pasta-bolo',
    name: 'Pasta a la Bolognesa',
    tag: 'Tradicional',
    desc: 'Penne con salsa bolognesa. Queso rallado aparte.',
  },
  {
    id: 'ensalada-cesar',
    name: 'Ensalada César con Pollo',
    tag: 'Light / Sin TACC',
    desc: 'Lechuga, pollo, crutones sin TACC opcionales, aderezo César.',
  },
  {
    id: 'empanadas',
    name: 'Empanadas de Carne (x3)',
    tag: 'Especial',
    desc: 'Tres empanadas de carne cortada a cuchillo. Opción: humita.',
  },
  {
    id: 'tartas-verdura',
    name: 'Tarta de Verdura',
    tag: 'Saludable / Veggie',
    desc: 'Tarta casera de verduras de estación con ensalada.',
  },
  {
    id: 'pescado-limon',
    name: 'Pescado al Limón con Arroz',
    tag: 'Light / Sin TACC',
    desc: 'Filet al limón con arroz y vegetales salteados.',
  },
  {
    id: 'asado-guarnicion',
    name: 'Asado con Guarnición',
    tag: 'Especial',
    desc: 'Tira de asado con papas al horno o ensalada criolla.',
  },
  {
    id: 'wok-verduras',
    name: 'Wok de Verduras y Tofu',
    tag: 'Saludable / Veggie',
    desc: 'Wok salteado con tofu, soja y arroz basmati.',
  },
]

/**
 * Menús semanales semilla por empresa.
 * Rota platos para almuerzo/cena con hasta 4 opciones.
 */
function buildMenusForCompany(companyId) {
  const lunchPools = [
    ['milanesa-pure', 'pollo-grillado', 'guiso-lentejas', 'ensalada-cesar'],
    ['pasta-bolo', 'empanadas', 'tartas-verdura', 'pescado-limon'],
    ['asado-guarnicion', 'wok-verduras', 'milanesa-pure', 'pollo-grillado'],
    ['guiso-lentejas', 'ensalada-cesar', 'pasta-bolo', 'empanadas'],
    ['tartas-verdura', 'pescado-limon', 'asado-guarnicion', 'wok-verduras'],
    ['milanesa-pure', 'pasta-bolo', 'pollo-grillado', 'ensalada-cesar'],
    ['empanadas', 'guiso-lentejas', 'tartas-verdura', 'asado-guarnicion'],
  ]

  const dinnerPools = [
    ['pasta-bolo', 'wok-verduras', 'ensalada-cesar', 'empanadas'],
    ['milanesa-pure', 'pescado-limon', 'guiso-lentejas', 'tartas-verdura'],
    ['pollo-grillado', 'asado-guarnicion', 'pasta-bolo', 'wok-verduras'],
    ['empanadas', 'ensalada-cesar', 'milanesa-pure', 'pescado-limon'],
    ['guiso-lentejas', 'tartas-verdura', 'pollo-grillado', 'asado-guarnicion'],
    ['wok-verduras', 'pasta-bolo', 'empanadas', 'ensalada-cesar'],
    ['pescado-limon', 'milanesa-pure', 'guiso-lentejas', 'pollo-grillado'],
  ]

  return DAY_IDS.map((dayId, index) => ({
    id: `${companyId}_${dayId}`,
    companyId,
    dayId,
    lunch: lunchPools[index],
    dinner: dinnerPools[index],
  }))
}

export const SEED_MENUS = [
  ...buildMenusForCompany('lyg'),
  ...buildMenusForCompany('gyl'),
]

export function withTimestamps(items, now = Date.now()) {
  return items.map((item, i) => ({
    ...item,
    createdAt: new Date(now - i * 1000).toISOString(),
  }))
}
