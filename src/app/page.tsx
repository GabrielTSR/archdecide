'use client'

import { useState, useCallback, useMemo } from 'react'
import { runDomain, sliderToRps, fmtVolume } from '@/lib/domain'
import {
  DEFAULT_COST_PER_DEV_JUNIOR,
  DEFAULT_TEAM_COMPOSITION,
  DEFAULT_SENIORITY_FACTOR,
  DEFAULT_COMPLEXITY_FACTOR,
  DEFAULT_PRODUCTIVITY_FACTOR,
  DEFAULT_MICRO_MIN_TEAM,
  DEFAULT_GROWTH_KEY,
  DEFAULT_RPS_SLIDER,
  DEFAULT_PROJECTION_MONTHS,
  VELOCITY_RAMP_MONTHS,
} from '@/lib/defaults'
import type { AppState, GrowthKey, BreakdownTab } from '@/lib/types'

import Header from '@/components/Header'
import InputsCard from '@/components/InputsCard'
import ResultsColumn from '@/components/ResultsColumn'
import CostChart from '@/components/CostChart'
import ProjectionChart from '@/components/ProjectionChart'
import VelocityChart from '@/components/VelocityChart'
import ModelParamsCard from '@/components/ModelParamsCard'
import InfraBreakdown from '@/components/InfraBreakdown'
import MethodologyAccordion from '@/components/MethodologyAccordion'
import Footer from '@/components/Footer'

const DEFAULT_STATE: AppState = {
  rps:              sliderToRps(DEFAULT_RPS_SLIDER),
  growthKey:        DEFAULT_GROWTH_KEY,
  breakdownTab:     'small',
  costPerDevJunior: DEFAULT_COST_PER_DEV_JUNIOR,
  teamComposition:  { ...DEFAULT_TEAM_COMPOSITION },
  seniorityFactor:  { ...DEFAULT_SENIORITY_FACTOR },
  complexityFactor: { ...DEFAULT_COMPLEXITY_FACTOR },
  productivityFactor: { ...DEFAULT_PRODUCTIVITY_FACTOR },
  microMinTeam:         DEFAULT_MICRO_MIN_TEAM,
  projectionMonths:     DEFAULT_PROJECTION_MONTHS,
  velocityRampMonths:   { ...VELOCITY_RAMP_MONTHS },
}

export default function Home() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE)

  const result = useMemo(() => runDomain(state), [state])

  const update = useCallback((patch: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  const resetModelParams = useCallback(() => {
    setState(prev => ({
      ...prev,
      seniorityFactor:    { ...DEFAULT_SENIORITY_FACTOR },
      complexityFactor:   { ...DEFAULT_COMPLEXITY_FACTOR },
      productivityFactor: { ...DEFAULT_PRODUCTIVITY_FACTOR },
      microMinTeam:       DEFAULT_MICRO_MIN_TEAM,
      velocityRampMonths: { ...VELOCITY_RAMP_MONTHS },
    }))
  }, [])

  const volDisplay = fmtVolume(result.volume)

  return (
    <>
      <Header />
      <div className="wrap">

        <div className="grid2">
          <InputsCard
            state={state}
            volDisplay={volDisplay}
            onUpdate={update}
          />
          <ResultsColumn result={result} state={state} />
        </div>

        <div className="grid2">
          <CostChart result={result} />
          <ProjectionChart result={result} state={state} onUpdate={update} />
        </div>

        <VelocityChart result={result} state={state} />

        <ModelParamsCard
          state={state}
          onUpdate={update}
          onReset={resetModelParams}
        />

        <InfraBreakdown
          activeTab={state.breakdownTab}
          onTabChange={(tab: BreakdownTab) => update({ breakdownTab: tab })}
        />

        <div className="sec-lbl" style={{ marginBottom: '.75rem' }}>Como o modelo funciona</div>
        <MethodologyAccordion onApply={update} />

        <Footer />
      </div>
    </>
  )
}
