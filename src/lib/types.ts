export type ArchKey = 'monolith' | 'microservices' | 'serverless'
export type GrowthKey = 'none' | 'low' | 'medium' | 'high'
export type BreakdownTab = 'small' | 'medium' | 'large'
export type SeniorityLevel = 'junior' | 'pleno' | 'senior'

export interface TeamComposition {
  junior: number
  pleno: number
  senior: number
}

export interface SeniorityFactors {
  junior: number
  pleno: number
  senior: number
}

export interface ArchFactors {
  monolith: number
  microservices: number
  serverless: number
}

export interface AppState {
  rps: number
  growthKey: GrowthKey
  breakdownTab: BreakdownTab
  costPerDevJunior: number
  teamComposition: TeamComposition
  seniorityFactor: SeniorityFactors
  complexityFactor: ArchFactors
  productivityFactor: ArchFactors
  microMinTeam: number
  microFullBenefitMultiplier: number
  srvProdMaxSmallTeam: number
  projectionMonths: number
  velocityRampMonths: ArchFactors
}

export interface DomainResult {
  infraCosts: Record<ArchKey, number>
  adjEngCosts: Record<ArchKey, number>
  totalCosts: Record<ArchKey, number>
  baseEngCost: number
  effectiveRatios: Record<ArchKey, number>
  winner: ArchKey
  volume: number
  projection: Record<ArchKey, number>[]
  steadyVelocity: Record<ArchKey, number>
  velocityProjection: Record<ArchKey, number>[]
}

export interface BreakdownRow {
  section: string
  name: string
  sku: string
  qty: string
  usd: number
  note: string
}

export interface ArchBreakdown {
  totalUsd: number
  rows: BreakdownRow[]
}
