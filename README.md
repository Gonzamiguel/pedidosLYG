# ViandApp — Pedidos de Viandas Empresariales

Plataforma multi-empresa para pedidos semanales de viandas (Almuerzo y Cena), pensada **mobile-first** para empleados que cargan desde el celular.

## Stack

- **Frontend:** React 19 + Vite
- **Estilos:** Tailwind CSS v4 + Lucide Icons
- **Backend:** Firebase Firestore + Firebase Authentication
- **Deploy:** Vercel

## Inicio rápido

```bash
npm install
npm run dev
```

Las credenciales van en `.env` (ya configurado localmente). `.env` está en `.gitignore`.

## Admin con rol en Firestore

1. En **Firebase Authentication** → creá un usuario Email/Password.
2. Copiá el **UID** del usuario.
3. En **Firestore** → colección `users` → documento con ID = **UID**:

```json
{
  "email": "admin@tuempresa.com",
  "role": "admin",
  "name": "Administrador"
}
```

También se acepta documento con ID = email (mismo contenido).

4. En la app, tocá el ícono **Admin** (escudo) e iniciá sesión con ese email/contraseña.
5. Tocá **Seed** para cargar empresas LYG/GYL, 10 platos y menús semanales.

### Reglas Firestore

Publicá el archivo `firestore.rules` del repo (o desde Firebase Console):

- Empleados: leen menús/platos/empresas y **crean** pedidos (sin login)
- Admin (`role: admin`): escribe catálogo/menús y lee consolidado de pedidos

## Modelo de datos

| Colección | Descripción |
|-----------|-------------|
| `users` | Perfiles; admin = `{ role: "admin", email }` |
| `companies` | Empresas (código + nombre) |
| `dishes` | Catálogo central de platos |
| `weekly_menus` | Menú por empresa y día (`{companyId}_{dayId}`) |
| `orders` | Pedidos con detalle semanal |

## Funcionalidades

### Empleado (mobile-first)
- Formulario táctil: empresa, nombre, sector, WhatsApp
- Tabs Lun–Dom con badges
- Almuerzo (ámbar) / Cena (índigo) con − / + / input numérico
- Footer sticky con total + revisar/enviar
- WhatsApp prearmado

### Admin
- Login Firebase Auth + verificación `role: admin`
- Platos, Config. Menú, Empresas, Consolidado + CSV

## Deploy en Vercel

Cargá las variables `VITE_FIREBASE_*` en el proyecto de Vercel y desplegá.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo local |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
