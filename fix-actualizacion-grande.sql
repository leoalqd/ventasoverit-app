-- =========================================================
-- ACTUALIZACIÓN GRANDE — correr una sola vez en Supabase → SQL Editor → Run
-- Subcategorías, fotos múltiples (producto y variante), código postal,
-- descuentos, forma de pago y página de contacto.
-- =========================================================

-- Subcategorías (categorías con padre)
alter table categories add column if not exists parent_id bigint references categories(id) on delete cascade;
alter table categories drop constraint if exists categories_name_key;
alter table categories drop constraint if exists categories_name_parent_key;
alter table categories add constraint categories_name_parent_key unique (name, parent_id);

-- Fotos múltiples
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
alter table product_images enable row level security;
alter table variant_images enable row level security;
drop policy if exists "Publico ve fotos de productos" on product_images;
create policy "Publico ve fotos de productos" on product_images for select to anon using (true);
drop policy if exists "Logueados gestionan fotos de productos" on product_images;
create policy "Logueados gestionan fotos de productos" on product_images for all to authenticated using (true) with check (true);
drop policy if exists "Publico ve fotos de variantes" on variant_images;
create policy "Publico ve fotos de variantes" on variant_images for select to anon using (true);
drop policy if exists "Logueados gestionan fotos de variantes" on variant_images;
create policy "Logueados gestionan fotos de variantes" on variant_images for all to authenticated using (true) with check (true);

-- Código postal del cliente/destinatario
alter table customers add column if not exists postal_code text;

-- Descuentos y forma de pago en ventas del POS
alter table sales add column if not exists discount_type text check (discount_type in ('PERCENT','AMOUNT'));
alter table sales add column if not exists payment_method text check (payment_method in ('EFECTIVO','TARJETA','TRANSFERENCIA'));

-- WhatsApp del negocio
alter table store_settings add column if not exists whatsapp_number text;
drop policy if exists "Publico lee whatsapp" on store_settings;
create policy "Publico lee whatsapp" on store_settings for select to anon using (true);

-- Página de contacto
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
drop policy if exists "Publico lee contacto" on store_contact;
create policy "Publico lee contacto" on store_contact for select to anon using (true);
drop policy if exists "Publico lee contacto (logueados)" on store_contact;
create policy "Publico lee contacto (logueados)" on store_contact for select to authenticated using (true);
drop policy if exists "Logueados editan contacto" on store_contact;
create policy "Logueados editan contacto" on store_contact for update to authenticated using (true);
drop policy if exists "Publico lee fotos de contacto" on contact_images;
create policy "Publico lee fotos de contacto" on contact_images for select to anon using (true);
drop policy if exists "Publico lee fotos de contacto (logueados)" on contact_images;
create policy "Publico lee fotos de contacto (logueados)" on contact_images for select to authenticated using (true);
drop policy if exists "Logueados crean fotos de contacto" on contact_images;
create policy "Logueados crean fotos de contacto" on contact_images for insert to authenticated with check (true);
drop policy if exists "Logueados borran fotos de contacto" on contact_images;
create policy "Logueados borran fotos de contacto" on contact_images for delete to authenticated using (true);

-- Permisos base de las tablas nuevas
grant select, insert, update, delete on
  product_images, variant_images, store_contact, contact_images
to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
