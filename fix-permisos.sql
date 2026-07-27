-- =========================================================
-- FIX DE PERMISOS — correr una sola vez en Supabase → SQL Editor → Run
-- Soluciona el error "permission denied for table products" y por qué
-- no se veían productos ni banners aunque las políticas estaban bien.
-- =========================================================

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  profiles, categories, brands, products, product_variants,
  stock_movements, sales, sale_items, customers, orders, order_items,
  store_settings, banners
to anon, authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;
