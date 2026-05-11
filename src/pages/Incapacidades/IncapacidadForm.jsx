import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getIncapacidadById, createIncapacidad, updateIncapacidad } from '../../services/incapacidades'
import { getColaboradores } from '../../services/colaboradores'
import { calcularDias, calcularValorEstimado } from '../../utils/calculadora'
import { useAuth } from '../../context/AuthContext'

const CAMPOS_INICIALES = {
  colaborador_id: '',
  tipo: '',
  diagnostico: '',
  fecha_inicio: '',
  fecha_fin: '',
  origen: '',
  observaciones: '',
}

const TIPOS = [
  { value: 'enfermedad_general', label: 'Enfermedad General' },
  { value: 'laboral',            label: 'Accidente Laboral' },
  { value: 'accidente_transito', label: 'Accidente de Tránsito' },
  { value: 'licencia',           label: 'Licencia' },
]

export default function IncapacidadForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { session } = useAuth()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState(CAMPOS_INICIALES)
  const [colaboradores, setColaboradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})
  const [busquedaCol, setBusquedaCol] = useState('')

  useEffect(() => {
    async function cargarDatos() {
      try {
        const cols = await getColaboradores()
        setColaboradores(cols)

        if (esEdicion) {
          const inc = await getIncapacidadById(id)
          setForm({
            colaborador_id: inc.colaborador_id ?? '',
            tipo:           inc.tipo ?? '',
            diagnostico:    inc.diagnostico ?? '',
            fecha_inicio:   inc.fecha_inicio ?? '',
            fecha_fin:      inc.fecha_fin ?? '',
            origen:         inc.origen ?? '',
            observaciones:  inc.observaciones ?? '',
          })
        }
      } catch {
        toast.error('Error al cargar datos')
        navigate('/incapacidades')
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [id, esEdicion, navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: null }))
  }

  function validar() {
    const e = {}
    if (!form.colaborador_id) e.colaborador_id = 'Selecciona un colaborador'
    if (!form.tipo)           e.tipo = 'Selecciona el tipo de novedad'
    if (!form.fecha_inicio)   e.fecha_inicio = 'La fecha de inicio es obligatoria'
    if (!form.fecha_fin)      e.fecha_fin = 'La fecha de fin es obligatoria'
    if (form.fecha_inicio && form.fecha_fin && form.fecha_fin < form.fecha_inicio) {
      e.fecha_fin = 'La fecha de fin no puede ser anterior a la de inicio'
    }
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nuevosErrores = validar()
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    setGuardando(true)
    try {
      const payload = {
        ...form,
        created_by: session?.user?.id ?? null,
      }

      if (esEdicion) {
        await updateIncapacidad(id, payload)
        toast.success('Incapacidad actualizada')
      } else {
        await createIncapacidad(payload)
        toast.success('Incapacidad registrada')
      }
      navigate('/incapacidades')
    } catch (err) {
      toast.error('Error al guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const dias = calcularDias(form.fecha_inicio, form.fecha_fin)

  const colaboradorSeleccionado = colaboradores.find((c) => c.id === form.colaborador_id)
  const calculo = dias > 0 && colaboradorSeleccionado?.salario_base
    ? calcularValorEstimado(dias, colaboradorSeleccionado.salario_base)
    : null

  const colsFiltrados = colaboradores.filter((c) =>
    c.nombre.toLowerCase().includes(busquedaCol.toLowerCase()) ||
    c.cedula.includes(busquedaCol)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate('/incapacidades')}
          className="text-muted hover:text-text text-sm transition-colors"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-semibold text-text">
          {esEdicion ? 'Editar incapacidad' : 'Registrar incapacidad'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Colaborador */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text">
            Colaborador *
          </label>
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={busquedaCol}
            onChange={(e) => setBusquedaCol(e.target.value)}
            className="input-field mb-2"
          />
          <select
            name="colaborador_id"
            value={form.colaborador_id}
            onChange={handleChange}
            className={`input-field ${errores.colaborador_id ? 'border-danger' : ''}`}
          >
            <option value="">— Seleccionar colaborador —</option>
            {colsFiltrados.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} · CC {c.cedula}
              </option>
            ))}
          </select>
          {errores.colaborador_id && (
            <p className="mt-1 text-xs text-danger">{errores.colaborador_id}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text">
            Tipo de novedad *
          </label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            className={`input-field ${errores.tipo ? 'border-danger' : ''}`}
          >
            <option value="">— Seleccionar tipo —</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errores.tipo && <p className="mt-1 text-xs text-danger">{errores.tipo}</p>}
        </div>

        {/* Diagnóstico */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Diagnóstico (CIE-10)</label>
          <input
            type="text"
            name="diagnostico"
            value={form.diagnostico}
            onChange={handleChange}
            placeholder="Ej: J06.9 - Infección aguda de vías respiratorias"
            className="input-field"
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text">Fecha inicio *</label>
            <input
              type="date"
              name="fecha_inicio"
              value={form.fecha_inicio}
              onChange={handleChange}
              className={`input-field font-mono ${errores.fecha_inicio ? 'border-danger' : ''}`}
            />
            {errores.fecha_inicio && (
              <p className="mt-1 text-xs text-danger">{errores.fecha_inicio}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-text">Fecha fin *</label>
            <input
              type="date"
              name="fecha_fin"
              value={form.fecha_fin}
              onChange={handleChange}
              min={form.fecha_inicio}
              className={`input-field font-mono ${errores.fecha_fin ? 'border-danger' : ''}`}
            />
            {errores.fecha_fin && (
              <p className="mt-1 text-xs text-danger">{errores.fecha_fin}</p>
            )}
          </div>
        </div>

        {/* Panel financiero en tiempo real */}
        {dias > 0 && (
          <div className="rounded-lg border border-muted/20 bg-bg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-muted/10">
              <span className="text-sm font-medium text-text">Estimación de pago</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted">
                  <span className="font-mono text-accent font-semibold">{dias}</span> días
                </span>
                {calculo?.pasaAfp && (
                  <span className="text-xs font-medium text-danger bg-danger/10 border border-danger/30 rounded px-2 py-0.5">
                    ⚑ AFP día 181+
                  </span>
                )}
                {!calculo?.pasaAfp && dias >= 90 && (
                  <span className="text-xs font-medium text-warning bg-warning/10 border border-warning/30 rounded px-2 py-0.5">
                    ⚑ Alerta día {dias >= 150 ? '150' : dias >= 120 ? '120' : '90'}
                  </span>
                )}
              </div>
            </div>

            {calculo ? (
              <div className="divide-y divide-muted/10">
                <FilaCalculo
                  label="Días 1–2 · Empresa (100% IBC)"
                  valor={calculo.desglose.empresa}
                  sublabel={`IBC diario: ${cop(calculo.ibcDiario)}`}
                />
                {dias >= 3 && (
                  <FilaCalculo
                    label={`Días 3–${Math.min(dias, 90)} · EPS (66.67% IBC)`}
                    valor={dias <= 90
                      ? calculo.desglose.eps
                      : calcularValorEstimado(Math.min(dias, 90), colaboradorSeleccionado.salario_base).desglose.eps
                    }
                  />
                )}
                {dias >= 91 && (
                  <FilaCalculo
                    label={`Días 91–${Math.min(dias, 180)} · EPS (50% IBC)`}
                    valor={calculo.desglose.eps - calcularValorEstimado(90, colaboradorSeleccionado.salario_base).desglose.eps}
                  />
                )}
                <div className="flex items-center justify-between px-4 py-3 bg-accent/5">
                  <span className="text-sm font-semibold text-text">Total estimado</span>
                  <span className="font-mono font-bold text-accent text-base">{cop(calculo.valorTotal)}</span>
                </div>
              </div>
            ) : (
              <p className="px-4 py-3 text-sm text-muted">
                Selecciona un colaborador para ver la estimación de pago
              </p>
            )}
          </div>
        )}

        {/* Origen */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Origen</label>
          <input
            type="text"
            name="origen"
            value={form.origen}
            onChange={handleChange}
            placeholder="Ej: Clínica Las Américas, Hospital General"
            className="input-field"
          />
        </div>

        {/* Observaciones */}
        <div>
          <label className="mb-1 block text-sm font-medium text-text">Observaciones</label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows={3}
            placeholder="Notas adicionales sobre esta incapacidad..."
            className="input-field resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-muted/10 pt-4">
          <button
            type="button"
            onClick={() => navigate('/incapacidades')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn-primary disabled:opacity-60">
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Registrar incapacidad'}
          </button>
        </div>
      </form>
    </div>
  )
}

function cop(valor) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor)
}

function FilaCalculo({ label, valor, sublabel }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <div>
        <span className="text-sm text-muted">{label}</span>
        {sublabel && <p className="text-xs text-muted/60 mt-0.5">{sublabel}</p>}
      </div>
      <span className="font-mono text-sm text-text">{cop(valor)}</span>
    </div>
  )
}
