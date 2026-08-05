# Pedidos Logística y Gastronomía

Plataforma de pedidos de viandas empresariales.

## Módulos admin

1. **Consolidado de pedidos** — filtros por empresa, almuerzo/cena, día y mes; detalle de quién pidió qué.
2. **Formularios** — generar formulario por empresa + fechas + platos por día; al guardar se crea el link.
3. **Configuración** — cargar empresas y cargar platos (dos vistas).

## Flujo

1. Configuración → cargar empresas y platos  
2. Formularios → empresa, desde/hasta, platos por día → Guardar → copiar link  
3. Empleados abren `/pedido/{formId}`  
4. Consolidado → revisar pedidos con filtros  

## Auth admin

Documento Firestore `users/{UID}` con `{ "role": "admin", "email": "..." }`.

Publicá `firestore.rules` en Firebase.
