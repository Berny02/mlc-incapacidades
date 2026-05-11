-- ============================================================
-- MLC Soluciones — Seed Data
-- Ejecutar en Supabase SQL Editor después del schema.sql
-- IMPORTANTE: Ajustar los UUIDs de auth.users si cambian
-- ============================================================

-- Colaboradores de prueba
INSERT INTO colaboradores (nombre, cedula, cargo, area, eps, arl, salario_base) VALUES
  ('Ana María Rodríguez',  '1020304050', 'Analista de Datos',      'Tecnología',       'Sanitas',    'Positiva',  4500000),
  ('Carlos Andrés Gómez',  '1030405060', 'Desarrollador Senior',   'Tecnología',       'Nueva EPS',  'Sura',      6200000),
  ('Laura Sofía Martínez', '1040506070', 'Auxiliar Contable',      'Contabilidad',     'Compensar',  'Positiva',  2800000),
  ('Jorge Luis Herrera',   '1050607080', 'Coordinador de Nómina',  'Recursos Humanos', 'Famisanar',  'AXA',       3900000),
  ('Valentina Torres',     '1060708090', 'Diseñadora UX',          'Marketing',        'Sanitas',    'Positiva',  3500000),
  ('Miguel Ángel Vargas',  '1070809100', 'Jefe de Operaciones',    'Operaciones',      'Coomeva',    'Sura',      5800000),
  ('Daniela Ospina',       '1080910110', 'Asistente Administrativa','Administración',  'Nueva EPS',  'AXA',       2400000),
  ('Andrés Felipe Ruiz',   '1091011120', 'Técnico de Soporte',     'Tecnología',       'Compensar',  'Positiva',  2900000);

-- Incapacidades de prueba (colaborador_id referencia la tabla, estado variado)
-- Primero obtenemos los IDs insertados
DO $$
DECLARE
  v_ana    uuid;
  v_carlos uuid;
  v_laura  uuid;
  v_jorge  uuid;
  v_vale   uuid;
  v_miguel uuid;
  v_dani   uuid;
  v_andres uuid;
BEGIN
  SELECT id INTO v_ana    FROM colaboradores WHERE cedula = '1020304050';
  SELECT id INTO v_carlos FROM colaboradores WHERE cedula = '1030405060';
  SELECT id INTO v_laura  FROM colaboradores WHERE cedula = '1040506070';
  SELECT id INTO v_jorge  FROM colaboradores WHERE cedula = '1050607080';
  SELECT id INTO v_vale   FROM colaboradores WHERE cedula = '1060708090';
  SELECT id INTO v_miguel FROM colaboradores WHERE cedula = '1070809100';
  SELECT id INTO v_dani   FROM colaboradores WHERE cedula = '1080910110';
  SELECT id INTO v_andres FROM colaboradores WHERE cedula = '1091011120';

  -- Ana — enfermedad general, 45 días, en cobro
  INSERT INTO incapacidades (colaborador_id, tipo, diagnostico, fecha_inicio, fecha_fin, origen, estado, observaciones)
  VALUES (v_ana, 'enfermedad_general', 'Lumbalgia crónica', '2025-03-01', '2025-04-14', 'EPS', 'en_cobro',
          'Radicada en EPS el 15 de marzo. En proceso de cobro.');

  -- Carlos — enfermedad general, 180 días, crítica, pendiente
  INSERT INTO incapacidades (colaborador_id, tipo, diagnostico, fecha_inicio, fecha_fin, origen, estado, observaciones)
  VALUES (v_carlos, 'enfermedad_general', 'Depresión mayor - episodio severo', '2024-10-01', '2025-03-29', 'EPS', 'transcrita',
          'Se requiere envío urgente al fondo de pensiones.');

  -- Laura — enfermedad general, 15 días, pagada
  INSERT INTO incapacidades (colaborador_id, tipo, diagnostico, fecha_inicio, fecha_fin, origen, estado)
  VALUES (v_laura, 'enfermedad_general', 'Faringitis aguda', '2025-04-10', '2025-04-24', 'EPS', 'pagada');

  -- Jorge — accidente laboral, 30 días, en cobro
  INSERT INTO incapacidades (colaborador_id, tipo, diagnostico, fecha_inicio, fecha_fin, origen, estado, observaciones)
  VALUES (v_jorge, 'laboral', 'Fractura de muñeca derecha', '2025-02-15', '2025-03-16', 'ARL', 'en_cobro',
          'Accidente durante instalación de equipos. ARL reportada.');

  -- Valentina — licencia, 15 días, pendiente
  INSERT INTO incapacidades (colaborador_id, tipo, diagnostico, fecha_inicio, fecha_fin, origen, estado)
  VALUES (v_vale, 'licencia', 'Licencia de maternidad (parcial)', '2025-05-01', '2025-05-15', 'EPS', 'pendiente');

  -- Miguel — enfermedad general, 160 días, alerta AFP
  INSERT INTO incapacidades (colaborador_id, tipo, diagnostico, fecha_inicio, fecha_fin, origen, estado, observaciones)
  VALUES (v_miguel, 'enfermedad_general', 'Cardiopatía isquémica', '2024-11-15', '2025-04-24', 'EPS', 'transcrita',
          'Concepto de rehabilitación solicitado. Pendiente respuesta EPS.');

  -- Daniela — accidente de tránsito, 10 días, rechazada
  INSERT INTO incapacidades (colaborador_id, tipo, diagnostico, fecha_inicio, fecha_fin, origen, estado, observaciones)
  VALUES (v_dani, 'accidente_transito', 'Contusión múltiple', '2025-01-20', '2025-01-29', 'EPS', 'rechazada',
          'Rechazada por EPS — no se acreditó relación con accidente de tránsito.');

  -- Andrés — enfermedad general, 120 días, nivel rehabilitación
  INSERT INTO incapacidades (colaborador_id, tipo, diagnostico, fecha_inicio, fecha_fin, origen, estado, observaciones)
  VALUES (v_andres, 'enfermedad_general', 'Hernia discal L4-L5', '2025-01-01', '2025-04-30', 'EPS', 'en_cobro',
          'Concepto de rehabilitación gestionado. Respuesta esperada antes del día 150.');
END;
$$;
