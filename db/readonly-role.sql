-- Usuario de solo lectura para herramientas externas (MCP de Claude, reportes, etc.)
-- Puede consultar todas las tablas, pero no insertar, modificar ni borrar nada.
-- Se puede correr varias veces sin problema.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gastos_ro') THEN
    CREATE ROLE gastos_ro LOGIN PASSWORD 'gastos_ro';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE gastos_fijos TO gastos_ro;
GRANT USAGE ON SCHEMA public TO gastos_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO gastos_ro;

-- Las tablas que creen migraciones futuras también van a ser legibles
ALTER DEFAULT PRIVILEGES FOR ROLE gastos IN SCHEMA public GRANT SELECT ON TABLES TO gastos_ro;
