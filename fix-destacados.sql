-- =========================================================
-- ACTUALIZACIÓN — correr una sola vez en Supabase → SQL Editor → Run
-- Permite elegir qué productos se muestran en la página principal.
-- =========================================================
alter table products add column if not exists featured boolean not null default true;
