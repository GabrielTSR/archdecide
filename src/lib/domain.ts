import { CONFIG, ARCH_KEYS } from './config'
import { MICRO_SMALL_TEAM_PENALTY } from './defaults'
import type { AppState, ArchKey, DomainResult } from './types'

export function logInterpolate(rps: number, anchors: { rps: number; usd: number }[]): number {
  const r = Math.max(1, rps)
  const [a, b, c] = anchors
  if (r <= a.rps) return a.usd
  if (r >= c.rps) {
    const slope = (c.usd - b.usd) / (c.rps - b.rps)
    return c.usd + slope * (r - c.rps)
  }
  const [lo, hi] = r <= b.rps ? [a, b] : [b, c]
  const t = (Math.log(r) - Math.log(lo.rps)) / (Math.log(hi.rps) - Math.log(lo.rps))
  return lo.usd + t * (hi.usd - lo.usd)
}

export function computeInfraCosts(rps: number): Record<ArchKey, number> {
  return Object.fromEntries(
    ARCH_KEYS.map(arch => [arch, Math.round(logInterpolate(rps, CONFIG.costAnchors[arch]))])
  ) as Record<ArchKey, number>
}

export function deriveVolume(rps: number): number {
  return Math.max(Math.round(rps * 86_400 * 30 / CONFIG.occupancyFactor / 1_000) * 1_000, 1_000)
}

export function monthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1
}

export function computeBaseEngineeringCost(
  teamComposition: AppState['teamComposition'],
  costPerDevJunior: number,
  seniorityFactor: AppState['seniorityFactor']
): number {
  return Object.entries(teamComposition).reduce((total, [level, count]) => {
    return total + count * costPerDevJunior * seniorityFactor[level as keyof typeof seniorityFactor]
  }, 0)
}

/**
 * Escala o fator de produtividade de microsserviços pelo tamanho da equipe.
 * Abaixo do limiar (microMinTeam), a produtividade é interpolada linearmente
 * de MICRO_SMALL_TEAM_PENALTY (1 dev) até o valor configurado (microMinTeam devs).
 * Isso reflete que equipes pequenas não têm times independentes suficientes
 * para colher os benefícios de paralelismo da arquitetura (Lei de Conway).
 */
export function applyMicroTeamThreshold(
  productivityFactor: AppState['productivityFactor'],
  teamComposition: AppState['teamComposition'],
  microMinTeam: number,
): AppState['productivityFactor'] {
  const total = teamComposition.junior + teamComposition.pleno + teamComposition.senior
  if (total === 0 || total >= microMinTeam) return productivityFactor
  const t = (total - 1) / Math.max(1, microMinTeam - 1)
  const effectivePf = MICRO_SMALL_TEAM_PENALTY + t * (productivityFactor.microservices - MICRO_SMALL_TEAM_PENALTY)
  return { ...productivityFactor, microservices: effectivePf }
}

export function computeAdjustedEngineeringCosts(
  baseEngCost: number,
  complexityFactor: AppState['complexityFactor'],
  productivityFactor: AppState['productivityFactor']
): Record<ArchKey, number> {
  return Object.fromEntries(
    ARCH_KEYS.map(arch => [
      arch,
      Math.round(baseEngCost * complexityFactor[arch] / productivityFactor[arch]),
    ])
  ) as Record<ArchKey, number>
}

export function computeEffectiveRatios(
  complexityFactor: AppState['complexityFactor'],
  productivityFactor: AppState['productivityFactor']
): Record<ArchKey, number> {
  return Object.fromEntries(
    ARCH_KEYS.map(arch => [arch, complexityFactor[arch] / productivityFactor[arch]])
  ) as Record<ArchKey, number>
}

export function pickWinner(totalCosts: Record<ArchKey, number>): ArchKey {
  return Object.entries(totalCosts).sort((a, b) => a[1] - b[1])[0][0] as ArchKey
}

export function projectTotalCosts(
  rpsInicial: number,
  annualRate: number,
  baseEngCost: number,
  complexityFactor: AppState['complexityFactor'],
  productivityFactor: AppState['productivityFactor'],
  months: number,
): Record<ArchKey, number>[] {
  const rate = monthlyRate(annualRate)
  return Array.from({ length: months }, (_, m) => {
    const projRps = rpsInicial * Math.pow(1 + rate, m)
    return Object.fromEntries(
      ARCH_KEYS.map(arch => [
        arch,
        Math.round(logInterpolate(projRps, CONFIG.costAnchors[arch]))
          + Math.round(baseEngCost * complexityFactor[arch] / productivityFactor[arch]),
      ])
    ) as Record<ArchKey, number>
  })
}

/**
 * Velocidade de entrega em regime permanente (após ramp-up).
 * Unidade: equivalentes-de-dev-monolito por mês.
 *   velocidade = devs_totais / ratio_efetivo[arq]
 * Ratio menor = maior produtividade por dev = maior velocidade.
 */
export function computeSteadyVelocity(
  teamComposition: AppState['teamComposition'],
  effectiveRatios: Record<ArchKey, number>,
): Record<ArchKey, number> {
  const totalDevs = teamComposition.junior + teamComposition.pleno + teamComposition.senior
  return Object.fromEntries(
    ARCH_KEYS.map(arch => [arch, effectiveRatios[arch] > 0 ? totalDevs / effectiveRatios[arch] : 0])
  ) as Record<ArchKey, number>
}

/**
 * Projeta a velocidade mês a mês aplicando uma curva de ramp-up linear
 * por arquitetura. Captura o "custo de partida" de cada estilo:
 * monolito atinge velocidade plena rápido, microsserviços demora meses
 * (setup de service mesh, observabilidade, contratos, cultura DevOps).
 */
export function projectVelocity(
  steadyVelocity: Record<ArchKey, number>,
  months: number,
  velocityRampMonths: Record<ArchKey, number>,
): Record<ArchKey, number>[] {
  return Array.from({ length: months }, (_, m) => {
    const monthNum = m + 1
    return Object.fromEntries(
      ARCH_KEYS.map(arch => {
        const ramp = Math.max(1, velocityRampMonths[arch])
        const factor = Math.min(1, monthNum / ramp)
        return [arch, steadyVelocity[arch] * factor]
      })
    ) as Record<ArchKey, number>
  })
}

export function runDomain(st: AppState): DomainResult {
  const infraCosts  = computeInfraCosts(st.rps)
  const volume      = deriveVolume(st.rps)
  const baseEngCost = computeBaseEngineeringCost(st.teamComposition, st.costPerDevJunior, st.seniorityFactor)
  const effectivePf = applyMicroTeamThreshold(st.productivityFactor, st.teamComposition, st.microMinTeam)
  const adjEngCosts = computeAdjustedEngineeringCosts(baseEngCost, st.complexityFactor, effectivePf)
  const effectiveRatios = computeEffectiveRatios(st.complexityFactor, effectivePf)
  const totalCosts = Object.fromEntries(
    ARCH_KEYS.map(arch => [arch, infraCosts[arch] + adjEngCosts[arch]])
  ) as Record<ArchKey, number>
  const winner     = pickWinner(totalCosts)
  const growthRate = CONFIG.growthRates[st.growthKey].annualRate
  const months     = st.projectionMonths
  const projection = projectTotalCosts(st.rps, growthRate, baseEngCost, st.complexityFactor, effectivePf, months)
  const steadyVelocity     = computeSteadyVelocity(st.teamComposition, effectiveRatios)
  const velocityProjection = projectVelocity(steadyVelocity, months, st.velocityRampMonths)
  return {
    infraCosts, adjEngCosts, totalCosts, baseEngCost, effectiveRatios,
    winner, volume, projection, steadyVelocity, velocityProjection,
  }
}

export function sliderToRps(val: number): number {
  return Math.round(Math.exp(Math.log(1) + (val / 100) * (Math.log(1500) - Math.log(1))))
}

export function fmtVolume(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1).replace('.0', '') + 'M req'
  return Math.round(v / 1_000) + 'k req'
}

export function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR')
}
