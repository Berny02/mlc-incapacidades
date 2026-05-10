export function calcularNivelAlerta(diasAcumulados) {
  if (diasAcumulados >= 180) {
    return {
      nivel: 'critica',
      mensaje: 'Día 180+ — Traslado a AFP',
      color: '#E63946',
      tailwind: 'text-danger bg-danger/10 border-danger/30',
    }
  }
  if (diasAcumulados >= 150) {
    return {
      nivel: 'afp',
      mensaje: 'Día 150 — Enviar soportes a AFP',
      color: '#F4A261',
      tailwind: 'text-warning bg-warning/10 border-warning/30',
    }
  }
  if (diasAcumulados >= 120) {
    return {
      nivel: 'rehabilitacion',
      mensaje: 'Día 120 — Gestionar Concepto de Rehabilitación',
      color: '#F4A261',
      tailwind: 'text-warning bg-warning/10 border-warning/30',
    }
  }
  if (diasAcumulados >= 90) {
    return {
      nivel: 'preventiva',
      mensaje: 'Día 90 — Alerta preventiva de acumulación',
      color: '#4CAF50',
      tailwind: 'text-ok bg-ok/10 border-ok/30',
    }
  }
  return {
    nivel: 'normal',
    mensaje: 'Sin alerta',
    color: '#4CAF50',
    tailwind: 'text-ok bg-ok/10 border-ok/30',
  }
}
