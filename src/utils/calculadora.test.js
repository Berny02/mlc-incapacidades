import { describe, it, expect } from 'vitest'
import { calcularValorEstimado, calcularDias } from './calculadora'

const SALARIO = 1_300_000 // salario mínimo 2024
const IBC_DIARIO = SALARIO / 30 // 43_333.33

describe('calcularDias', () => {
  it('cuenta correctamente días entre dos fechas', () => {
    expect(calcularDias('2026-01-01', '2026-01-10')).toBe(10)
  })

  it('retorna 1 cuando inicio y fin son el mismo día', () => {
    expect(calcularDias('2026-03-15', '2026-03-15')).toBe(1)
  })

  it('retorna 0 si fecha fin es anterior a inicio', () => {
    expect(calcularDias('2026-05-10', '2026-05-01')).toBe(0)
  })

  it('retorna 0 si alguna fecha es vacía', () => {
    expect(calcularDias('', '2026-01-10')).toBe(0)
    expect(calcularDias('2026-01-01', '')).toBe(0)
  })
})

describe('calcularValorEstimado — tramos', () => {
  it('Caso 1 — 2 días: solo empresa al 100%', () => {
    const { valorTotal, desglose, ibcDiario, pasaAfp } = calcularValorEstimado(2, SALARIO)
    expect(ibcDiario).toBeCloseTo(IBC_DIARIO, 0)
    expect(desglose.empresa).toBeCloseTo(IBC_DIARIO * 2, 0)
    expect(desglose.eps).toBe(0)
    expect(valorTotal).toBeCloseTo(IBC_DIARIO * 2, 0)
    expect(pasaAfp).toBe(false)
  })

  it('Caso 2 — 10 días: empresa días 1-2, EPS días 3-10 al 66.67%', () => {
    const { desglose } = calcularValorEstimado(10, SALARIO)
    expect(desglose.empresa).toBeCloseTo(IBC_DIARIO * 2, 0)
    expect(desglose.eps).toBeCloseTo(IBC_DIARIO * 8 * 0.6667, 0)
  })

  it('Caso 3 — 90 días: empresa 2 días + EPS 88 días al 66.67%', () => {
    const { desglose, pasaAfp } = calcularValorEstimado(90, SALARIO)
    expect(desglose.empresa).toBeCloseTo(IBC_DIARIO * 2, 0)
    expect(desglose.eps).toBeCloseTo(IBC_DIARIO * 88 * 0.6667, 0)
    expect(pasaAfp).toBe(false)
  })

  it('Caso 4 — 120 días: empresa 2d + EPS 88d al 66.67% + EPS 30d al 50%', () => {
    const { desglose } = calcularValorEstimado(120, SALARIO)
    const epsTramo2 = IBC_DIARIO * 88 * 0.6667
    const epsTramo3 = IBC_DIARIO * 30 * 0.5
    expect(desglose.empresa).toBeCloseTo(IBC_DIARIO * 2, 0)
    expect(desglose.eps).toBeCloseTo(epsTramo2 + epsTramo3, 0)
  })

  it('Caso 5 — 180 días: tope máximo, EPS cubre días 3-180', () => {
    const { desglose, pasaAfp } = calcularValorEstimado(180, SALARIO)
    const epsTramo2 = IBC_DIARIO * 88 * 0.6667
    const epsTramo3 = IBC_DIARIO * 90 * 0.5
    expect(desglose.empresa).toBeCloseTo(IBC_DIARIO * 2, 0)
    expect(desglose.eps).toBeCloseTo(epsTramo2 + epsTramo3, 0)
    expect(pasaAfp).toBe(false)
  })

  it('Caso 6 — 200 días: pasaAfp=true, cálculo solo hasta día 180', () => {
    const r180 = calcularValorEstimado(180, SALARIO)
    const r200 = calcularValorEstimado(200, SALARIO)
    expect(r200.pasaAfp).toBe(true)
    // El valor calculado no cambia más allá de 180
    expect(r200.valorTotal).toBeCloseTo(r180.valorTotal, 0)
  })

  it('Caso 7 — 1 día: solo empresa, un día al 100%', () => {
    const { desglose } = calcularValorEstimado(1, SALARIO)
    expect(desglose.empresa).toBeCloseTo(IBC_DIARIO, 0)
    expect(desglose.eps).toBe(0)
  })
})
