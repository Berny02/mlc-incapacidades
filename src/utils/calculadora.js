/**
 * Calcula el valor estimado a pagar según la normativa colombiana.
 * Tramo 1: días 1-2   → 100% IBC diario (empresa)
 * Tramo 2: días 3-90  → 66.67% IBC diario (EPS)
 * Tramo 3: días 91-180 → 50% IBC diario (EPS)
 * Día 181+ → Responsabilidad pasa a AFP (no se calcula aquí)
 */
export function calcularValorEstimado(diasTotales, salarioBase) {
  const ibcDiario = salarioBase / 30
  let empresa = 0
  let eps = 0

  const dias = Math.min(diasTotales, 180)

  if (dias >= 1) {
    const diasTramo1 = Math.min(dias, 2)
    empresa = diasTramo1 * ibcDiario * 1.0
  }

  if (dias >= 3) {
    const diasTramo2 = Math.min(dias, 90) - 2
    eps += diasTramo2 * ibcDiario * 0.6667
  }

  if (dias >= 91) {
    const diasTramo3 = Math.min(dias, 180) - 90
    eps += diasTramo3 * ibcDiario * 0.5
  }

  return {
    valorTotal: empresa + eps,
    desglose: { empresa, eps },
    ibcDiario,
    pasaAfp: diasTotales > 180,
  }
}

export function calcularDias(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return 0
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  const diff = fin - inicio
  return diff < 0 ? 0 : Math.floor(diff / (1000 * 60 * 60 * 24)) + 1
}
