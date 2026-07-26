# Ventas Over IT — Arquitectura del Sistema

## 1. Visión general

Sistema de gestión de stock y ventas (POS + e-commerce) para un negocio de indumentaria, con panel administrativo, escaneo de códigos de barras desde el celular (PWA) y tienda online sin login para clientes.

Se divide en **3 aplicaciones independientes** que comparten el mismo backend/API:

1. **Backend API** (Node + Express + Prisma + PostgreSQL) — única fuente de verdad.
2. **Panel Administrativo / POS** (React + Vite) — para admin y empleados.
3. **Tienda Online** (React + Vite, PWA) — para clientes, sin login.

```
ventas-over-it/
├── backend/                  # API REST
├── admin-pos/                # Panel admin + punto de venta (a implementar luego)
├── storefront/               # Tienda online PWA (a implementar luego)
└── ARQUITECTURA.md
```

Empezamos por el **backend**, ya que todo (POS, tienda, panel) depende de él.

## 2. Decisiones técnicas y por qué

| Decisión | Motivo |
|---|---|
| **PostgreSQL** en vez de MySQL | Mejor soporte de tipos (enums nativos, JSON, arrays), más robusto para reportes y agregaciones (ventas por día/mes), y Prisma lo aprovecha mejor. |
| **Prisma ORM** | Migraciones versionadas, tipado automático, buena DX, evita SQL injection por diseño. |
| **Arquitectura en capas (Controller → Service → Repository/Prisma)** | Separa HTTP de lógica de negocio. Los tests y el mantenimiento futuro (ej. agregar WhatsApp, sucursales) son mucho más simples. |
| **Módulos por dominio** (`modules/auth`, `modules/products`, `modules/sales`, etc.) en vez de por tipo de archivo | Escala mejor: cada módulo es autocontenible (rutas, controlador, servicio, validación). |
| **JWT con refresh token** | Stateless, funciona bien para POS en tablet/celular y para la PWA de escaneo. |
| **RBAC simple con tabla de permisos** | Admin y Empleados con permisos configurables, sin hardcodear roles en el código — se guardan en la base. |
| **Variantes de producto como tabla separada (`ProductVariant`)** | Permite combinaciones color×talle con stock independiente, y que cada variante tenga su propio código de barras. |
| **Código de barras Code128 generado en backend** | Se genera a partir de un `sku` único de la variante; se renderiza a imagen/PDF bajo demanda (no se guarda como archivo, se genera al vuelo). |
| **PWA para escaneo** en vez de app nativa | El usuario pidió explícitamente no depender de lector físico; con `BarcodeDetector` API / librería `zxing` desde el navegador alcanza, sin necesidad de tiendas de apps. |
| **Pedidos de tienda como estado `PENDING`** | No hay pago online: el pedido queda pendiente y el admin lo gestiona manualmente (transferencia o link de pago externo). |

## 3. Modelo de datos (resumen)

- **User** (admin/empleado) → **Role** → **Permission**
- **Product** → **ProductVariant** (color, talle, sku, barcode, stock)
- **StockMovement** (entradas, ajustes, ventas — auditoría completa)
- **Sale** → **SaleItem** (POS)
- **Order** → **OrderItem** (tienda online, cliente sin cuenta)
- **Customer** (datos de la compra, no requiere login)
- **Category**, **Brand**
- **ActivityLog** (auditoría de acciones sensibles)

El detalle completo está en `backend/prisma/schema.prisma`.

## 4. Estructura del backend

```
backend/
├── prisma/
│   ├── schema.prisma        # Modelo completo de datos
│   └── seed.js              # Crea el admin inicial (sin hardcodear password en el código fuente)
├── src/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.middleware.js     # Verifica JWT
│   │   ├── permission.middleware.js # Verifica permisos por acción
│   │   └── error.middleware.js
│   ├── modules/
│   │   ├── auth/             # login, refresh, logout
│   │   ├── users/            # ABM de usuarios (admin)
│   │   ├── products/         # ABM productos + variantes + barcode
│   │   └── ... (sales, stock, orders, reports se agregan en siguientes etapas)
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── password.js
│   │   └── barcode.js
│   ├── app.js
│   └── server.js
├── .env.example
└── package.json
```

## 5. Seguridad implementada desde el inicio

- Contraseñas con `bcrypt` (hash + salt).
- JWT firmado con secret en variable de entorno (`.env`, nunca en código).
- Prisma parametriza queries → previene SQL Injection.
- `helmet` + sanitización de inputs → mitiga XSS.
- Validación de payloads con `zod` en cada endpoint.
- Rate limiting en `/auth/login` para evitar fuerza bruta.
- Middleware de permisos: cada endpoint sensible declara qué permiso requiere.
- `ActivityLog`: registra quién hizo qué y cuándo (crear producto, ajustar stock, eliminar usuario, etc.).

## 6. Plan de implementación por etapas

1. ✅ **Etapa 1 (esta entrega):** Arquitectura + Módulo de autenticación + Módulo de productos y variantes (con generación de código de barras).
2. Etapa 2: Stock (ingresos, ajustes, historial, alertas de stock mínimo).
3. Etapa 3: Ventas / POS + descuento automático de stock.
4. Etapa 4: PWA de escaneo con cámara.
5. Etapa 5: Tienda online (storefront) + pedidos pendientes.
6. Etapa 6: Panel administrativo (dashboard, gráficos, reportes PDF/Excel).
7. Etapa 7: Backups automáticos, logs, endurecimiento de seguridad, preparación multi-sucursal.

Sobre la nota de seguridad: vi que en tu mensaje escribiste un usuario y contraseña de administrador en texto plano. Te recomiendo cambiar esa contraseña antes de usarla en producción, ya que quedó en este chat — el script `seed.js` está armado para que definas las credenciales solo por variables de entorno, nunca hardcodeadas en el repo.
