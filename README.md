# Pedidos Logística y Gastronomía

Plataforma de pedidos de viandas empresariales.

## Módulos admin

1. **Menú del día** — totales a preparar por plato para una fecha + quién lo pidió (paginado).
2. **Consolidado** — todos los pedidos con filtros (empresa, servicio, día, mes, año) y export Excel.
3. **Formularios** — generar formulario por empresa + fechas + platos por día; al guardar se crea el link.
4. **Configuración** — empresas, platos y lugares de entrega.

## Flujo

1. Configuración → cargar empresas y platos  
2. Formularios → empresa, desde/hasta, platos por día → Guardar → copiar link  
3. Empleados abren `/pedido/{formId}`  
4. Menú del día → ver qué preparar hoy  
5. Consolidado → historial completo y export  

## Auth admin

Documento Firestore `users/{UID}` con `{ "role": "admin", "email": "..." }`.

Publicá `firestore.rules` en Firebase.
