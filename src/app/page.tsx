'use client'

import { fmtVolume } from '@/lib/domain'
import { useAppState } from '@/hooks/useAppState'
import type { BreakdownTab } from '@/lib/types'

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

export default function Home() {
  const { state, result, update, resetModelParams } = useAppState()
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
