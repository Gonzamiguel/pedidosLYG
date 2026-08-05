# ViandApp — Pedidos de Viandas Empresariales

Plataforma multi-empresa para gestionar y realizar pedidos semanales de viandas (Almuerzo y Cena), de lunes a domingo.

## Stack

- **Frontend:** React 19 + Vite
- **Estilos:** Tailwind CSS v4 + Lucide Icons
- **Backend:** Firebase Firestore + Firebase Authentication
- **Deploy:** Vercel

## Inicio rápido (modo demo local)

Sin configurar Firebase, la app funciona con **localStorage** y datos semilla (empresas LYG/GYL, 10 platos y menús semanales).

```bash
npm install
npm run dev
```

- Formulario de pedidos: vista principal
- Panel Master: botón **Master** → clave demo `viandapp-master`

## Configurar Firebase

1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Activá **Authentication** (Email/Password) y **Firestore Database**
3. Copiá `.env.example` a `.env` y completá las variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ADMIN_EMAIL=admin@tuempresa.com
VITE_ADMIN_DEMO_KEY=viandapp-master
```

4. Creá el usuario admin en Firebase Auth con el mismo email de `VITE_ADMIN_EMAIL`
5. En el Panel Master, usá el botón **Seed** para cargar empresas, platos y menús

### Reglas Firestore sugeridas (desarrollo)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Ajustá las reglas para producción según tu política de seguridad.

## Modelo de datos

| Colección | Descripción |
|-----------|-------------|
| `companies` | Empresas (código + nombre) |
| `dishes` | Catálogo central de platos |
| `weekly_menus` | Menú por empresa y día (`{companyId}_{dayId}`) |
| `orders` | Pedidos con detalle semanal |

## Funcionalidades

### Empleado
- Datos del solicitante (empresa, nombre, sector, teléfono)
- Tabs Lunes–Domingo con badges de cantidad
- Almuerzo (ámbar) y Cena (índigo) con selector − / + / input numérico
- Observaciones por turno
- Badge de límite 10:30 AM
- Sticky footer con total + confirmar
- Envío a Firestore / WhatsApp

### Master Admin
- Gestión de platos
- Configurador de menús (hasta 4 platos por turno)
- Gestión de empresas
- Consolidado de cocina + métricas + export CSV

## Deploy en Vercel

```bash
npm run build
```

Conectá el repo a Vercel y cargá las variables `VITE_*` en el proyecto.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo local |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Lint con oxlint |

## Estructura

```
src/
  components/
    Header.jsx
    ClientForm.jsx
    DayTabs.jsx
    MenuCard.jsx
    MasterPanel.jsx
    OrderConfirmModal.jsx
    admin/
  data/          # constants + seed
  firebase/      # config + services + localStore
  hooks/
  utils/
```
