import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getColaboradores, deleteColaborador } from '../../services/colaboradores'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function ColaboradoresList() {
  const navigate = useNavigate()
  const [colaboradores, setColaboradores] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [eliminandoId, setEliminandoId] = useState(null)
  const [confirmando, setConfirmando] = useState(null) // colaborador a eliminar

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    try {
      const data = await getColaboradores()
      setColaboradores(data)
    } catch (err) {
      toast.error('Error al cargar colaboradores')
    } finally {
      setLoading(false)
    }
  }

  async function handleEliminar() {
    const colaborador = confirmando
    setConfirmando(null)
    setEliminandoId(colaborador.id)
    try {
      await deleteColaborador(colaborador.id)
      setColaboradores((prev) => prev.filter((c) => c.id !== colaborador.id))
      toast.success('Colaborador eliminado')
    } catch (err) {
      toast.error('No se puede eliminar: tiene incapacidades asociadas')
    } finally {
      setEliminandoId(null)
    }
  }

  const filtrados = colaboradores.filter((c) => {
    const q = busqueda.toLowerCase()
    return (
      c.nombre?.toLowerCase().includes(q) ||
      c.cedula?.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    )
  }

  return (
    <div>
      {confirmando && (
        <ConfirmModal
          titulo="Eliminar colaborador"
          mensaje={`¿Estás seguro de que deseas eliminar a ${confirmando.nombre}? Esta acción no se puede deshacer.`}
          labelConfirmar="Sí, eliminar"
          onConfirmar={handleEliminar}
          onCancelar={() => setConfirmando(null)}
        />
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text">Colaboradores</h2>
          <p className="mt-1 text-sm text-muted">{colaboradores.length} registrado{colaboradores.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/colaboradores/nuevo')}
          className="btn-primary"
        >
          + Nuevo colaborador
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o cédula..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-field max-w-sm"
          />
        </div>

        {filtrados.length === 0 ? (
          <div className="py-12 text-center text-muted">
            {busqueda ? 'Sin resultados para la búsqueda' : 'No hay colaboradores registrados'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-muted/10 text-left text-muted">
                  <th className="pb-3 pr-4 font-medium">Nombre</th>
                  <th className="pb-3 pr-4 font-medium">Cédula</th>
                  <th className="pb-3 pr-4 font-medium">Cargo</th>
                  <th className="pb-3 pr-4 font-medium">Área</th>
                  <th className="pb-3 pr-4 font-medium">EPS</th>
                  <th className="pb-3 pr-4 font-medium">ARL</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-muted/10">
                {filtrados.map((c) => (
                  <tr key={c.id} className="hover:bg-bg/50 transition-colors">
                    <td className="py-3 pr-4 font-medium text-text">{c.nombre}</td>
                    <td className="py-3 pr-4 font-mono text-muted">{c.cedula}</td>
                    <td className="py-3 pr-4 text-text">{c.cargo ?? '—'}</td>
                    <td className="py-3 pr-4 text-text">{c.area ?? '—'}</td>
                    <td className="py-3 pr-4 text-text">{c.eps ?? '—'}</td>
                    <td className="py-3 pr-4 text-text">{c.arl ?? '—'}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/colaboradores/${c.id}/editar`)}
                          className="text-accent hover:text-accent-hover text-xs font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setConfirmando(c)}
                          disabled={eliminandoId === c.id}
                          className="text-muted hover:text-danger text-xs font-medium transition-colors disabled:opacity-40"
                        >
                          {eliminandoId === c.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
