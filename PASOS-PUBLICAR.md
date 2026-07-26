# VENTAS OVER IT — Guía completa desde cero

Esta es la guía definitiva, de punta a punta, para dejar tu panel funcionando en internet: con base de datos real, login protegido, punto de venta y escaneo de códigos de barras desde la cámara del celular.

**Vas a usar 3 servicios, todos gratuitos:**

| Servicio | Para qué |
|---|---|
| **Supabase** | Base de datos + login de administrador + fotos de productos |
| **GitHub** | Guardar el código del proyecto |
| **Vercel** | Publicar la app con un link público |

Tiempo estimado: 30-40 minutos. Instrucciones pensadas para **Mac**.

---

## PASO 1 — Crear la base de datos en Supabase

1. Entrá a **[supabase.com](https://supabase.com)** → **"Start your project"** → creá tu cuenta (con Google o email).
2. Click en **"New project"** y completá:
   - Nombre: `ventasoverit`
   - Contraseña de la base de datos: generá una y guardala en un lugar seguro (es técnica, distinta a la que usás para entrar al panel).
   - Región: `South America (São Paulo)`
3. Esperá 1-2 minutos a que el proyecto termine de crearse.
4. Menú lateral → **SQL Editor** → **New query**.
5. Abrí el archivo **`supabase-schema.sql`** (está en la carpeta del proyecto), copiá **todo** su contenido, pegalo en el editor y tocá **RUN**.
   - Esto crea las tablas de productos, variantes, stock y ventas, las protege para que solo usuarios logueados puedan leer/escribir, crea el espacio de almacenamiento (`productos`) para las fotos, y carga un producto de ejemplo (Remera Nike con 3 variantes) para que veas el panel funcionando de entrada.
6. Menú lateral → **Settings** (engranaje) → **API**. Copiá y guardá estos dos datos, los usás en el Paso 3:
  


 - **Project URL**

https://tipdgyuskmzoislovwxl.supabase.co/rest/v1/




   - **anon public key**

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpcGRneXVza216b2lzbG92d3hsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNzc3NjAsImV4cCI6MjEwMDY1Mzc2MH0.LoM2HQKAF2KkPVAEJSJ5nHHnkHSLP22b-zxg6yZhykU


---

## PASO 2 — Crear tu usuario administrador

1. Menú lateral → **Authentication** → **Users**.
2. Botón **"Add user"** → **"Create new user"**.
3. Completá:
   - **Email:** `leoalqd@ventasoverit.com`
   - **Password:** elegí una contraseña nueva y segura (no reutilices contraseñas de otros sistemas).
   - Tildá **"Auto Confirm User"** (sin esto no vas a poder entrar).
4. Click en **Create user**.

Con esto ya podés loguearte en el panel usando `leoalqd` (sin el `@ventasoverit.com`, la app lo completa sola) y la contraseña que elegiste.

---

## PASO 3 — Completar las variables de conexión

A diferencia del proyecto anterior, acá el archivo `.env` **todavía no está completado** porque este es un proyecto de Supabase nuevo, recién creado por vos en el Paso 1 — yo no tengo esas credenciales.

1. Abrí **`env-example.txt`** con TextEdit.
2. Reemplazá las dos líneas con los datos que copiaste en el Paso 1 (Project URL y anon public key).
3. Guardalo y renombralo a `.env` desde Terminal, parado en la carpeta del proyecto:
   ```
   mv env-example.txt .env
   ```

> Nota técnica: como el archivo empieza con un punto (`.env`), macOS lo oculta en el Finder — es normal, está ahí igual. Para verlo, el atajo es **Cmd + Shift + Punto (.)** dentro de la carpeta.

---

## PASO 4 — Probar la app en tu computadora (recomendado antes de publicar)

1. Instalá [Node.js](https://nodejs.org) si no lo tenés (versión 18+, hay instalador para Mac).
2. En la misma Terminal, parado en la carpeta del proyecto:
   ```
   npm install
   npm run dev
   ```
3. Entrá a `http://localhost:5173`, logueate con `leoalqd` y tu contraseña, y confirmá que veas el producto de ejemplo (Remera Nike) con sus 3 variantes. Probá el Punto de Venta agregando una al carrito y confirmando la venta — el stock se descuenta solo.

---

## PASO 5 — Subir el código a GitHub

1. Creá una cuenta gratis en **[github.com](https://github.com)** si no tenés.
2. Creá un repositorio nuevo, por ejemplo `ventasoverit-app` (puede ser privado).
3. Subí **el contenido** de la carpeta del proyecto (los archivos sueltos: `package.json`, `index.html`, `src/`, etc.), **no la carpeta contenedora**. Es decir, `package.json` tiene que quedar visible directo en la raíz del repositorio, no dentro de una subcarpeta.
   - Se puede arrastrar y soltar directo desde la web de GitHub, sin usar comandos.
   - **No subas el archivo `.env`** con tus claves reales (ya está configurado para que GitHub lo ignore automáticamente vía `.gitignore`).

---

## PASO 6 — Publicar en Vercel

1. Entrá a **[vercel.com](https://vercel.com)** → creá cuenta usando tu usuario de GitHub.
2. **"Add New"** → **"Project"** → elegí el repositorio `ventasoverit-app`.
3. Antes de tocar **Deploy**, abrí **"Environment Variables"** y cargá las mismas dos variables del Paso 3:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click en **Deploy**. En 1-2 minutos te da un link fijo, por ejemplo:
   `https://ventasoverit-app.vercel.app`

---

## PASO 7 — Usarlo como una app desde el celular

1. Abrí el link de Vercel en el celular (Chrome en Android, Safari en iPhone).
2. Logueate con tu usuario y contraseña.
3. Agregalo a la pantalla de inicio:
   - **Android (Chrome):** ⋮ → "Agregar a pantalla de inicio"
   - **iPhone (Safari):** ícono de Compartir → "Agregar a inicio"
4. Te queda un ícono como una app normal. En el Punto de Venta, tocá **"Escanear"** para abrir la cámara y leer un código de barras directo.

> **Sobre el escaneo con cámara:** funciona de forma nativa en **Chrome para Android**. En **iPhone (Safari)**, iOS todavía no soporta esta función del navegador — en ese caso, se puede seguir usando la búsqueda manual del producto en el Punto de Venta sin ningún problema. Si más adelante necesitás escaneo confiable también en iPhone, se puede sumar una librería específica para eso (te lo armo cuando lo necesites).

---

## ✅ Con esto tenés

- Base de datos real y persistente (Supabase)
- Login protegido con tu usuario, con botón chico "Ingresar" en la barra de menú de la tienda
- ABM de productos con variantes (color/talle) y stock independiente
- Código de barras real (Code128) por variante
- **Etiqueta de producto imprimible a 50x25mm** (nombre, talle, precio y código de barras) — Panel → Productos → ícono de impresora en cada variante
- **Etiqueta de envío imprimible a 100x150mm** con tus datos de remitente (te los pide una sola vez y los guarda) + los datos del cliente que hizo el pedido — Panel → Pedidos → botón "Etiqueta"
- Punto de venta que descuenta stock automáticamente al confirmar una venta, con escaneo de código de barras con la cámara (Android/Chrome)
- **Tienda online sin login**, con página principal tipo Tiendanube: banner grande arriba, carrusel de ofertas, catálogo con filtros (categoría/precio) y stock visible, carrito, checkout con los datos del cliente, y banner grande abajo
- **Portada editable al loguearte:** con tu usuario logueado, en la página principal aparecen controles para subir/cambiar/borrar las imágenes de cada banner, directo ahí mismo
- Pedidos de la tienda con estado (Pendiente/Contactado/Confirmado/Cancelado) gestionables desde el Panel
- App publicada con link propio (Vercel), instalable en el celular

### Cómo cargar las imágenes de la portada
1. Entrá a la tienda (la URL principal) y tocá **"Ingresar"** arriba a la derecha.
2. Una vez logueado, vas a ver un botón **"+ Imagen"** arriba a la derecha de cada banner (el de arriba, el de ofertas, y el de abajo). Subí la imagen desde ahí.
3. Para sacar una imagen del carrusel, con esa imagen visible tocá la ✕ que aparece al lado.
4. Para volver a ver la tienda como la ve un cliente, tocá **"Salir"**.

### Sobre las etiquetas de envío
La primera vez que toques "Etiqueta" en un pedido, te va a pedir **tus datos como remitente** (nombre/razón social, dirección, ciudad, provincia, teléfono). Los guarda una sola vez — de ahí en adelante, cada etiqueta sale directo con esos datos + los del cliente de ese pedido en particular.

## Lo que todavía falta (próximas etapas)

Reportes (PDF/Excel) del lado del panel, gestión de usuarios/permisos desde el panel (hoy se crean manualmente en Supabase), backups automáticos, filtros de color/talle en la tienda (hoy tiene búsqueda, categoría y precio máximo), y subida de **fotos de producto** desde el ABM (hoy la subida de imágenes con botón funciona para los banners de portada; la foto de cada producto se puede cargar pegando una URL directamente en la base si querés usarla mientras tanto). Decime cuándo seguimos y avanzamos con la próxima etapa.

---

## Solución de problemas

**"404: NOT_FOUND" al abrir el link de Vercel**
El `package.json` quedó dentro de una subcarpeta del repositorio en vez de la raíz. Arreglo sin volver a subir nada: Vercel → **Settings → General → Root Directory → Edit** → escribí el nombre de esa subcarpeta → **Save** → **Deployments → Redeploy**.

**Página completamente en blanco**
Casi siempre son las variables de entorno faltantes o no aplicadas. Revisá Vercel → **Settings → Environment Variables** (con el tilde en **Production**) y hacé **Redeploy** — los cambios de variables no se aplican solos.

**El login funciona pero no aparecen los productos**
Revisá que hayas corrido el `supabase-schema.sql` completo en el SQL Editor (Paso 1.5). Si ya lo corriste, entrá a Supabase → **Table Editor → products** y confirmá que el producto de ejemplo esté ahí.

**El botón "Escanear" no abre la cámara**
En iPhone es esperado (ver nota del Paso 7). En Android, revisá que le hayas dado permiso de cámara al navegador cuando lo pidió.

**Otro error no listado acá**
Contame el mensaje exacto (o mandame una captura) y lo resolvemos puntual.

---

## Límites del plan gratuito

- **Supabase:** 500MB de base de datos, 1GB de fotos. El proyecto se pausa solo si pasa una semana sin uso (se reactiva solo, tarda unos segundos la primera vez).
- **Vercel:** de sobra para el tráfico de un negocio como el tuyo.
- Ambos tienen planes pagos desde pocos dólares al mes si en algún momento se queda corto — para arrancar no hace falta gastar nada.
