import { useState } from 'react'
import { Building2, Utensils } from 'lucide-react'
import CompaniesTab from './CompaniesTab'
import DishesTab from './DishesTab'

const VIEWS = [
  {
    id: 'companies',
    label: 'Cargar empresas',
    description: 'Altas y gestión de empresas',
    icon: Building2,
  },
  {
    id: 'dishes',
    label: 'Cargar nuevo plato',
    description: 'Catálogo central de platos',
    icon: Utensils,
  },
]

export default function ConfigModule({ catalog }) {
  const [view, setView] = useState('companies')

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        {VIEWS.map(({ id, label, description, icon: Icon }) => {
          const active = view === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`flex items-start gap-3 rounded-xl border px-4 py-4 text-left transition ${
                active
                  ? 'border-bordo-700 bg-bordo-700 text-white'
                  : 'border-stone-200 bg-white text-slate-700 hover:border-stone-300'
              }`}
            >
              <Icon
                className={`mt-0.5 h-5 w-5 shrink-0 ${
                  active ? 'text-bordo-200' : 'text-slate-400'
                }`}
              />
              <span>
                <span className="block text-sm font-semibold">{label}</span>
                <span
                  className={`mt-0.5 block text-xs ${
                    active ? 'text-bordo-100' : 'text-slate-500'
                  }`}
                >
                  {description}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {view === 'companies' ? (
        <CompaniesTab
          companies={catalog.companies}
          onCreate={catalog.addCompany}
          onDelete={catalog.removeCompany}
        />
      ) : (
        <DishesTab
          dishes={catalog.dishes}
          onCreate={catalog.addDish}
          onDelete={catalog.removeDish}
        />
      )}
    </div>
  )
}
