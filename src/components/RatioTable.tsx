import { CONFIG, ARCH_KEYS } from '@/lib/config'
import type { DomainResult, AppState } from '@/lib/types'

interface Props {
  result: DomainResult
  state: AppState
}

export default function RatioTable({ result, state }: Props) {
  const { effectiveRatios } = result
  const minRatio = Math.min(...Object.values(effectiveRatios))

  return (
    <div className="card" style={{ padding: '.875rem 1.1rem' }}>
      <div className="sec-lbl" style={{ marginBottom: '.5rem' }}>Razão efetiva de custo de engenharia por arquitetura</div>
      <div className="hint" style={{ marginBottom: '.5rem' }}>
        Ratio = Complexidade ÷ Produtividade. Menor ratio → engenharia mais barata. Quando ratio &lt; 1,0 a arquitetura é mais eficiente que o monolito.
      </div>
      <table className="ratio-table">
        <thead>
          <tr>
            <th>Arquitetura</th>
            <th>Complexidade</th>
            <th>Produtividade</th>
            <th>Ratio (C/P)</th>
            <th>Eng. efetiva vs. mono</th>
          </tr>
        </thead>
        <tbody>
          {ARCH_KEYS.map(k => {
            const cf     = state.complexityFactor[k]
            const pf     = state.productivityFactor[k]
            const ratio  = effectiveRatios[k]
            const vsBase = ratio / effectiveRatios['monolith']
            const isMin  = Math.abs(ratio - minRatio) < 0.001
            return (
              <tr key={k}>
                <td className={isMin ? 'ratio-win' : ''}>{CONFIG.architectures[k].label}</td>
                <td>{cf.toFixed(1)}×</td>
                <td>{pf.toFixed(1)}×</td>
                <td className={isMin ? 'ratio-win' : 'ratio-lose'}>{ratio.toFixed(2)}×</td>
                <td className={vsBase < 1 ? 'ratio-win' : 'ratio-lose'}>
                  {vsBase < 1 ? '▼' : '▲'} {Math.abs((vsBase - 1) * 100).toFixed(0)}% vs mono
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
