import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getColaboradores, createColaborador, updateColaborador } from '../../services/colaboradores'

const CAMPOS_INICIALES = {
  nombre: '',
  cedula: '',
  cargo: '',
  area: '',
  eps: '',
  arl: '',
  salario_base: '',
}

export default function ColaboradorForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState(CAMPOS_INICIALES)
  const [loading, setLoading] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [errores, setErrores] = useState({})

  useEffect(() => {
    if (!esEdicion) return
    getColaboradores().then((lista) => {
      const encontrado = lista.find((c) => c.id === id)
      if (encontrado) {
        setForm({
          nombre: encontrado.nombre ?? '',
          cedula: encontrado.cedula ?? '',
          cargo: encontrado.cargo ?? '',
          area: encontrado.area ?? '',
          eps: encontrado.eps ?? '',
          arl: encontrado.arl ?? '',
          salario_base: encontrado.salario_base ?? '',
        })
      } else {
        toast.error('Colaborador no encontrado')
        navigate('/colaboradores')
      }
      setLoading(false)
    })
  }, [id, esEdicion, navigate])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: null }))
  }

  function validar(todosLosColaboradores) {
    const nuevosErrores = {}

    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio'
    if (!form.cedula.trim()) nuevosErrores.cedula = 'La cédula es obligatoria'
    if (!form.salario_base || isNaN(Number(form.salario_base)) || Number(form.salario_base) <= 0) {
      nuevosErrores.salario_base = 'Ingresa un salario base válido'
    }

    const cedulaDuplicada = todosLosColaboradores.some(
      (c) => c.cedula === form.cedula.trim() && c.id !== id
    )
    if (cedulaDuplicada) nuevosErrores.cedula = 'Ya existe un colaborador con esta cédula'

    return nuevosErrores
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setGuardando(true)

    try {
      const todosLosColaboradores = await getColaboradores()
      const nuevosErrores = validar(todosLosColaboradores)

      if (Object.keys(nuevosErrores).length > 0) {
        setErrores(nuevosErrores)
        setGuardando(false)
        return
      }

      const payload = {
        ...form,
        salario_base: Number(form.salario_base),
        cedula: form.cedula.trim(),
        nombre: form.nombre.trim(),
      }

      if (esEdicion) {
        await updateColaborador(id, payload)
        toast.success('Colaborador actualizado')
      } else {
        await createColaborador(payload)
        toast.success('Colaborador creado')
      }

      navigate('/colaboradores')
    } catch (err) {
      toast.error('Error al guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

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
          onClick={() => navigate('/colaboradores')}
          className="text-muted hover:text-text text-sm transition-colors"
        >
          ← Volver
        </button>
        <h2 className="text-xl font-semibold text-text">
          {esEdicion ? 'Editar colaborador' : 'Nuevo colaborador'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Campo
            label="Nombre completo *"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            error={errores.nombre}
            placeholder="Ej: Juan García López"
          />
          <Campo
            label="Cédula *"
            name="cedula"
            value={form.cedula}
            onChange={handleChange}
            error={errores.cedula}
            placeholder="Ej: 1234567890"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo
            label="Cargo"
            name="cargo"
            value={form.cargo}
            onChange={handleChange}
            placeholder="Ej: Técnico de Mantenimiento"
          />
          <Campo
            label="Área"
            name="area"
            value={form.area}
            onChange={handleChange}
            placeholder="Ej: Producción"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Campo
            label="EPS"
            name="eps"
            value={form.eps}
            onChange={handleChange}
            placeholder="Ej: Sura, Nueva EPS, Sanitas"
          />
          <Campo
            label="ARL"
            name="arl"
            value={form.arl}
            onChange={handleChange}
            placeholder="Ej: Positiva, Sura, Colmena"
          />
        </div>

        <Campo
          label="Salario base (COP) *"
          name="salario_base"
          value={form.salario_base}
          onChange={handleChange}
          error={errores.salario_base}
          placeholder="Ej: 1300000"
          type="number"
          min="0"
        />

        <div className="flex justify-end gap-3 border-t border-muted/10 pt-4">
          <button
            type="button"
            onClick={() => navigate('/colaboradores')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn-primary disabled:opacity-60">
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear colaborador'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Campo({ label, name, value, onChange, error, placeholder, type = 'text', min }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-text">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className={`input-field ${error ? 'border-danger focus:border-danger' : ''}`}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  )
}
