-- ============================================================
-- MLC Soluciones — DDL completo
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- TABLA: perfiles (extiende auth.users)
create table public.perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null,
  rol        text not null check (rol in ('administrador', 'analista')),
  email      text not null,
  created_at timestamp with time zone default now()
);

-- TABLA: colaboradores
create table public.colaboradores (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  cedula       text not null unique,
  cargo        text,
  area         text,
  eps          text,
  arl          text,
  salario_base numeric(12, 2) not null default 0,
  created_at   timestamp with time zone default now()
);

-- TABLA: incapacidades
create table public.incapacidades (
  id               uuid primary key default gen_random_uuid(),
  colaborador_id   uuid not null references public.colaboradores(id) on delete restrict,
  tipo             text not null check (tipo in ('enfermedad_general','laboral','accidente_transito','licencia')),
  diagnostico      text,
  fecha_inicio     date not null,
  fecha_fin        date not null,
  origen           text,
  estado           text not null default 'pendiente' check (estado in ('pendiente','transcrita','en_cobro','pagada','rechazada')),
  soporte_url      text,
  observaciones    text,
  created_by       uuid references public.perfiles(id),
  created_at       timestamp with time zone default now()
);

-- TABLA: historial_estados
create table public.historial_estados (
  id               uuid primary key default gen_random_uuid(),
  incapacidad_id   uuid not null references public.incapacidades(id) on delete cascade,
  estado_anterior  text,
  estado_nuevo     text not null,
  cambiado_por     uuid references public.perfiles(id),
  fecha_cambio     timestamp with time zone default now(),
  observacion      text
);

-- ============================================================
-- VISTA: dias_acumulados por colaborador
-- Reemplaza la columna calculada — siempre actualizada
-- ============================================================
create or replace view public.dias_acumulados_por_colaborador as
select
  colaborador_id,
  sum(fecha_fin - fecha_inicio + 1) as dias_acumulados
from public.incapacidades
where estado not in ('rechazada')
group by colaborador_id;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.perfiles         enable row level security;
alter table public.colaboradores    enable row level security;
alter table public.incapacidades    enable row level security;
alter table public.historial_estados enable row level security;

-- Políticas: usuario autenticado accede a todo (app single-tenant)
create policy "Acceso autenticado" on public.perfiles
  for all using (auth.role() = 'authenticated');

create policy "Acceso autenticado" on public.colaboradores
  for all using (auth.role() = 'authenticated');

create policy "Acceso autenticado" on public.incapacidades
  for all using (auth.role() = 'authenticated');

create policy "Acceso autenticado" on public.historial_estados
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- TRIGGER: crear perfil automáticamente al registrar usuario
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre, email, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'rol', 'analista')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- STORAGE: bucket soportes-medicos
-- Ejecutar desde Storage UI o con este comando de referencia
-- ============================================================
-- insert into storage.buckets (id, name, public)
-- values ('soportes-medicos', 'soportes-medicos', false);
