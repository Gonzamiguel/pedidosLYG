# Pedidos L&G

Plataforma multi-empresa para pedidos semanales de viandas (Almuerzo y Cena).

- **Empleados:** formulario mobile-first
- **Administradores:** panel de escritorio a pantalla completa (sidebar + módulos)

## Stack

- React 19 + Vite
- Tailwind CSS v4 + Lucide Icons
- Firebase Firestore + Authentication
- Deploy en Vercel

## Inicio rápido

```bash
npm install
npm run dev
```

Credenciales en `.env` (no se versiona). Ver `.env.example`.

## Admin

1. Creá usuario en Firebase Authentication (Email/Password)
2. En Firestore → `users/{UID}`:

```json
{
  "email": "admin@tuempresa.com",
  "role": "admin",
  "name": "Administrador"
}
```

3. En la app → `/admin` → iniciar sesión
4. Creá empresas, platos y menús desde el panel (arranca vacío)
5. En **Empresas**, copiá el link de cada una (`/pedido/{codigo}`) y enviáselo

Publicá las reglas de `firestore.rules` en Firebase.

## Links por empresa

Cada empresa tiene su propio formulario:

```
https://tu-dominio.com/pedido/lyg
https://tu-dominio.com/pedido/gyl
```

El empleado no elige empresa: ya viene fijada en el link.

## Módulos del panel admin

| Módulo | Uso |
|--------|-----|
| Empresas | Altas + link de formulario |
| Semanas | Período del pedido (desde / hasta), una activa por empresa |
| Platos | Catálogo central |
| Configurar menú | Hasta 4 platos por turno / empresa / día |
| Consolidado cocina | Métricas de la semana + CSV |
| Historial | Todas las semanas y pedidos |

## Semanas

1. Admin → **Semanas** → elegí empresa → fecha desde / hasta (por defecto Lun–Dom)
2. Al crear, esa semana queda **activa** y el formulario `/pedido/{empresa}` la muestra
3. Cada pedido guarda `weekId`, `weekStart` y `weekEnd`
4. En **Historial** ves pedidos anteriores por empresa y semana

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm run preview` | Preview del build |
