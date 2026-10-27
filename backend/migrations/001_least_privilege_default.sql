-- Ejecutar explícitamente sobre la base elegida, tras revisar el entorno.
-- Solo cambia el valor predeterminado para cuentas nuevas. No altera cuentas existentes.
ALTER TABLE Usuarios ALTER COLUMN rol SET DEFAULT 'empleado';
