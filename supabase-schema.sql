-- =========================================================
-- VENTAS OVER IT — Esquema de base de datos para Supabase
-- Copiar TODO este archivo y ejecutarlo en Supabase → SQL Editor → Run
-- =========================================================

-- Perfil de cada usuario logueado (admin / empleado). Se completa solo
-- al crear el usuario en Authentication (Paso 2 de la guía).
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'EMPLOYEE' check (role in ('ADMIN','EMPLOYEE')),
  created_at timestamptz default now()
);

create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null,
  parent_id bigint references categories(id) on delete cascade,
  unique (name, parent_id)
);

create table if not exists brands (
  id bigint generated always as identity primary key,
  name text unique not null
);

create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  internal_code text unique not null,
  purchase_price numeric(10,2) not null default 0,
  sale_price numeric(10,2) not null default 0,
  category_id bigint references categories(id),
  brand_id bigint references brands(id),
  image_url text,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  featured boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists product_variants (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  color text,
  size text,
  sku text unique not null,
  barcode text unique not null,
  stock int not null default 0,
  min_stock int not null default 0,
  created_at timestamptz default now()
);

-- Hasta 4 fotos por producto y hasta 4 fotos por variante (color), ambas opcionales.
create table if not exists product_images (
  id bigint generated always as identity primary key,
  product_id bigint not null references products(id) on delete cascade,
  url text not null,
  order_index int not null default 0
);

create table if not exists variant_images (
  id bigint generated always as identity primary key,
  variant_id bigint not null references product_variants(id) on delete cascade,
  url text not null,
  order_index int not null default 0
);

create table if not exists stock_movements (
  id bigint generated always as identity primary key,
  variant_id bigint not null references product_variants(id),
  type text not null check (type in ('ENTRY','ADJUSTMENT','SALE')),
  quantity int not null,
  reason text,
  user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists sales (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  subtotal numeric(10,2) not null,
  discount numeric(10,2) not null default 0,
  discount_type text check (discount_type in ('PERCENT','AMOUNT')),
  total numeric(10,2) not null,
  customer_name text,
  customer_dni text,
  customer_phone text,
  payment_method text check (payment_method in ('EFECTIVO','TARJETA','TRANSFERENCIA')),
  created_at timestamptz default now()
);

create table if not exists sale_items (
  id bigint generated always as identity primary key,
  sale_id bigint not null references sales(id) on delete cascade,
  variant_id bigint not null references product_variants(id),
  quantity int not null,
  unit_price numeric(10,2) not null,
  discount numeric(10,2) not null default 0
);

-- =========================================================
-- TIENDA ONLINE: clientes sin login y pedidos pendientes
-- =========================================================
create table if not exists customers (
  id bigint generated always as identity primary key,
  first_name text not null,
  last_name text not null,
  dni text not null,
  address text not null,
  city text not null,
  province text not null,
  postal_code text,
  phone text not null,
  email text not null,
  created_at timestamptz default now()
);

create table if not exists orders (
  id bigint generated always as identity primary key,
  customer_id bigint not null references customers(id),
  reference_code text unique not null,
  subtotal numeric(10,2) not null,
  total numeric(10,2) not null,
  status text not null default 'PENDING' check (status in ('PENDING','CONTACTED','CONFIRMED','CANCELLED')),
  created_at timestamptz default now()
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  variant_id bigint not null references product_variants(id),
  quantity int not null,
  unit_price numeric(10,2) not null
);

alter table customers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- El cliente sin login necesita poder crear su pedido y leerlo de vuelta
-- (para mostrarle la confirmación en pantalla).
create policy "Cualquiera crea su ficha de cliente" on customers for insert to anon with check (true);
create policy "Cualquiera lee clientes" on customers for select to anon using (true);
create policy "Logueados gestionan clientes" on customers for all using (auth.role() = 'authenticated');

create policy "Cualquiera crea pedidos" on orders for insert to anon with check (true);
create policy "Cualquiera lee pedidos" on orders for select to anon using (true);
create policy "Logueados gestionan pedidos" on orders for all using (auth.role() = 'authenticated');

create policy "Cualquiera crea items de pedido" on order_items for insert to anon with check (true);
create policy "Cualquiera lee items de pedido" on order_items for select to anon using (true);
create policy "Logueados gestionan items de pedido" on order_items for all using (auth.role() = 'authenticated');

-- =========================================================
-- Acceso público de SOLO LECTURA a productos y variantes,
-- para que la tienda online funcione sin que el cliente se loguee.
-- (El panel interno sigue protegido: crear/editar/borrar sigue
-- requiriendo estar logueado, gracias a las políticas de arriba).
-- =========================================================
create policy "Publico ve categorias" on categories for select to anon using (true);
create policy "Publico ve marcas" on brands for select to anon using (true);
create policy "Publico ve productos activos" on products for select to anon using (status = 'ACTIVE');
create policy "Publico ve variantes de productos activos" on product_variants for select to anon using (
  exists (select 1 from products p where p.id = product_variants.product_id and p.status = 'ACTIVE')
);

-- =========================================================
-- CONFIGURACIÓN DE LA TIENDA (datos del remitente para etiquetas de envío)
-- =========================================================
create table if not exists store_settings (
  id int primary key default 1,
  sender_name text,
  sender_address text,
  sender_city text,
  sender_province text,
  sender_phone text,
  whatsapp_number text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into store_settings (id) values (1) on conflict (id) do nothing;

alter table store_settings enable row level security;
create policy "Logueados leen configuracion" on store_settings for select using (auth.role() = 'authenticated');
create policy "Logueados editan configuracion" on store_settings for update using (auth.role() = 'authenticated');
create policy "Publico lee whatsapp" on store_settings for select to anon using (true);

-- =========================================================
-- PÁGINA DE CONTACTO (editable, con fotos y HTML embebido de Street View)
-- =========================================================
create table if not exists store_contact (
  id int primary key default 1,
  business_name text default 'Over IT',
  address text default 'Juana Manuela Gorriti 984',
  instagram text default 'over.it.store',
  phone text default '388 311 6194',
  description text,
  streetview_embed_html text,
  updated_at timestamptz default now(),
  constraint single_row_contact check (id = 1)
);
insert into store_contact (id) values (1) on conflict (id) do nothing;

create table if not exists contact_images (
  id bigint generated always as identity primary key,
  url text not null,
  order_index int not null default 0
);

alter table store_contact enable row level security;
alter table contact_images enable row level security;
create policy "Publico lee contacto" on store_contact for select to anon using (true);
create policy "Publico lee contacto (logueados)" on store_contact for select to authenticated using (true);
create policy "Logueados editan contacto" on store_contact for update to authenticated using (true);

create policy "Publico lee fotos de contacto" on contact_images for select to anon using (true);
create policy "Publico lee fotos de contacto (logueados)" on contact_images for select to authenticated using (true);
create policy "Logueados crean fotos de contacto" on contact_images for insert to authenticated with check (true);
create policy "Logueados borran fotos de contacto" on contact_images for delete to authenticated using (true);

-- =========================================================
-- BANNERS / CARRUSELES de la página principal (editables al loguearse)
-- =========================================================
create table if not exists banners (
  id bigint generated always as identity primary key,
  section text not null check (section in ('hero_top','hero_bottom','carousel')),
  image_url text not null,
  link_url text,
  order_index int not null default 0,
  created_at timestamptz default now()
);

alter table banners enable row level security;
create policy "Publico ve banners" on banners for select to anon using (true);
create policy "Publico ve banners (logueados)" on banners for select to authenticated using (true);
create policy "Logueados crean banners" on banners for insert to authenticated with check (true);
create policy "Logueados eliminan banners" on banners for delete to authenticated using (true);
create policy "Logueados editan banners" on banners for update to authenticated using (true);

insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do nothing;

create policy "Cualquiera ve imagenes de banners" on storage.objects
  for select using (bucket_id = 'banners');
create policy "Logueados suben imagenes de banners" on storage.objects
  for insert with check (bucket_id = 'banners' and auth.role() = 'authenticated');
create policy "Logueados borran imagenes de banners" on storage.objects
  for delete using (bucket_id = 'banners' and auth.role() = 'authenticated');

-- =========================================================
-- PERMISOS BASE (grants de PostgreSQL, distintos de las políticas de
-- arriba). Sin esto, aunque las políticas estén bien, Postgres devuelve
-- "permission denied for table X" antes incluso de evaluar la política.
-- =========================================================
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  profiles, categories, brands, products, product_variants,
  stock_movements, sales, sale_items, customers, orders, order_items,
  store_settings, banners, product_images, variant_images,
  store_contact, contact_images
to anon, authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

-- =========================================================
-- Seguridad: solo usuarios logueados (admin/empleados) pueden
-- leer y escribir. No hay acceso público en esta versión.
-- =========================================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table brands enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table stock_movements enable row level security;
alter table sales enable row level security;
alter table sale_items enable row level security;
alter table product_images enable row level security;
alter table variant_images enable row level security;

create policy "Usuarios logueados pueden ver su perfil" on profiles
  for select using (auth.uid() = id);

create policy "Logueados leen categorias" on categories for select using (auth.role() = 'authenticated');
create policy "Logueados escriben categorias" on categories for insert with check (auth.role() = 'authenticated');

create policy "Logueados leen marcas" on brands for select using (auth.role() = 'authenticated');
create policy "Logueados escriben marcas" on brands for insert with check (auth.role() = 'authenticated');

create policy "Logueados leen productos" on products for select using (auth.role() = 'authenticated');
create policy "Logueados crean productos" on products for insert with check (auth.role() = 'authenticated');
create policy "Logueados editan productos" on products for update using (auth.role() = 'authenticated');
create policy "Logueados eliminan productos" on products for delete using (auth.role() = 'authenticated');

create policy "Logueados leen variantes" on product_variants for select using (auth.role() = 'authenticated');
create policy "Logueados crean variantes" on product_variants for insert with check (auth.role() = 'authenticated');
create policy "Logueados editan variantes" on product_variants for update using (auth.role() = 'authenticated');
create policy "Logueados eliminan variantes" on product_variants for delete using (auth.role() = 'authenticated');

create policy "Logueados leen movimientos" on stock_movements for select using (auth.role() = 'authenticated');
create policy "Logueados crean movimientos" on stock_movements for insert with check (auth.role() = 'authenticated');

create policy "Logueados leen ventas" on sales for select using (auth.role() = 'authenticated');
create policy "Logueados crean ventas" on sales for insert with check (auth.role() = 'authenticated');

create policy "Logueados leen items de venta" on sale_items for select using (auth.role() = 'authenticated');
create policy "Logueados crean items de venta" on sale_items for insert with check (auth.role() = 'authenticated');

create policy "Publico ve fotos de productos" on product_images for select to anon using (true);
create policy "Logueados gestionan fotos de productos" on product_images for all to authenticated using (true) with check (true);

create policy "Publico ve fotos de variantes" on variant_images for select to anon using (true);
create policy "Logueados gestionan fotos de variantes" on variant_images for all to authenticated using (true) with check (true);

-- =========================================================
-- Storage: espacio para fotos de productos
-- =========================================================
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

create policy "Cualquiera puede ver fotos de productos" on storage.objects
  for select using (bucket_id = 'productos');

create policy "Logueados suben fotos de productos" on storage.objects
  for insert with check (bucket_id = 'productos' and auth.role() = 'authenticated');

-- =========================================================
-- Datos de ejemplo (podés borrarlos después desde el panel)
-- =========================================================
insert into categories (name) values ('Remeras'), ('Buzos'), ('Jeans')
  on conflict (name) do nothing;

insert into brands (name) values ('Nike'), ('Adidas'), ('Levi''s')
  on conflict (name) do nothing;

insert into products (name, internal_code, purchase_price, sale_price, category_id, brand_id)
select 'Remera Nike', 'REM-NIKE-001', 8000, 15000, c.id, b.id
from categories c, brands b where c.name = 'Remeras' and b.name = 'Nike'
on conflict (internal_code) do nothing;

insert into product_variants (product_id, color, size, sku, barcode, stock, min_stock)
select p.id, 'Negro', 'M', 'REM-NIKE-001-NEG-M', '849021736514', 5, 2
from products p where p.internal_code = 'REM-NIKE-001'
on conflict (sku) do nothing;

insert into product_variants (product_id, color, size, sku, barcode, stock, min_stock)
select p.id, 'Negro', 'L', 'REM-NIKE-001-NEG-L', '849021736521', 8, 2
from products p where p.internal_code = 'REM-NIKE-001'
on conflict (sku) do nothing;

insert into product_variants (product_id, color, size, sku, barcode, stock, min_stock)
select p.id, 'Blanco', 'XL', 'REM-NIKE-001-BLA-XL', '849021736538', 2, 3
from products p where p.internal_code = 'REM-NIKE-001'
on conflict (sku) do nothing;
