-- =========================================================
-- ACTUALIZACIÓN — correr una sola vez en Supabase → SQL Editor → Run
-- Agrega los datos del cliente (nombre, DNI, WhatsApp) a cada venta
-- del Punto de Venta.
-- =========================================================
alter table sales add column if not exists customer_name text;
alter table sales add column if not exists customer_dni text;
alter table sales add column if not exists customer_phone text;
