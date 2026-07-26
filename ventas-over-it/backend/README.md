# Ventas Over IT — Backend (Etapa 1: Auth + Productos)

## Instalación

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus datos reales de PostgreSQL y las credenciales del admin inicial
```

## Base de datos

```bash
npx prisma migrate dev --name init
npm run seed     # Crea roles, permisos y el usuario administrador inicial
```

## Levantar el servidor

```bash
npm run dev
```

API disponible en `http://localhost:4000/api`.

## Endpoints implementados en esta etapa

### Autenticación (`/api/auth`)
- `POST /login` — `{ username, password }` → devuelve `accessToken` + cookie httpOnly con refresh token.
- `POST /refresh` — renueva el `accessToken`.
- `POST /logout` — revoca el refresh token.

### Usuarios (`/api/users`) — requiere rol ADMIN o permiso correspondiente
- `GET /` — listar usuarios.
- `POST /` — crear usuario `{ username, email, password, fullName, roleName }`.
- `PUT /:id` — editar usuario.
- `DELETE /:id` — baja lógica (desactiva) del usuario.

### Productos (`/api/products`)
- `GET /?search=&categoryId=&brandId=&status=` — listar/buscar productos.
- `GET /low-stock` — variantes con stock por debajo del mínimo.
- `GET /barcode/:barcode` — buscar variante por código de barras (para el escáner).
- `GET /barcode/:barcode/image` — imagen PNG del código de barras.
- `GET /:id` — detalle de un producto con sus variantes.
- `POST /` — crear producto con variantes iniciales.
- `PUT /:id` — editar datos generales del producto.
- `DELETE /:id` — baja lógica del producto.
- `POST /:id/variants` — agregar una variante nueva (color/talle) a un producto existente.
- `PUT /variants/:variantId` — editar una variante (ej: ajustar stock/minStock).
- `DELETE /variants/:variantId` — eliminar una variante.
- `POST /labels/pdf` — `{ variantIds: [1,2], copiesPerVariant: 2 }` → descarga PDF con etiquetas de código de barras listas para imprimir.

## Ejemplo de creación de producto con variantes

```json
POST /api/products
Authorization: Bearer <accessToken>

{
  "name": "Remera Nike",
  "internalCode": "REM-NIKE-001",
  "purchasePrice": 8000,
  "salePrice": 15000,
  "variants": [
    { "color": "Negro", "size": "M", "stock": 5, "minStock": 2 },
    { "color": "Negro", "size": "L", "stock": 8, "minStock": 2 },
    { "color": "Blanco", "size": "XL", "stock": 2, "minStock": 1 }
  ]
}
```

Cada variante recibe automáticamente un `sku` y un `barcode` únicos.

## Próximas etapas

Stock (ingresos/ajustes/historial), Ventas/POS, PWA de escaneo, Tienda online, Panel administrativo con dashboard y reportes, backups automáticos.
