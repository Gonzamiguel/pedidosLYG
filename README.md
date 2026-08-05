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

3. En la app → **Admin** → iniciar sesión
4. Tocá **Cargar Seed** para empresas LYG/GYL, platos y menús

Publicá las reglas de `firestore.rules` en Firebase.

## Módulos del panel admin

| Módulo | Uso |
|--------|-----|
| Platos | Catálogo central |
| Configurar menú | Hasta 4 platos por turno / empresa / día |
| Empresas | Altas de empresas |
| Consolidado cocina | Métricas + CSV |

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm run preview` | Preview del build |
