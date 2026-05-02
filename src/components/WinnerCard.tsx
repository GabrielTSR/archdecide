import { CONFIG, ARCH_KEYS } from '@/lib/config'
import { fmtBRL } from '@/lib/domain'
import type { DomainResult } from '@/lib/types'

export default function WinnerCard({ result }: { result: DomainResult }) {
  const { totalCosts, infraCosts, adjEngCosts, winner } = result
  const sorted = Object.entries(totalCosts).sort((a, b) => a[1] - b[1]) as [keyof typeof totalCosts, number][]
  const second = sorted[1]
  const arch   = CONFIG.architectures[winner]

  return (
    <div className={`winner-card ${arch.cssClass}`}>
      <div className="win-badge">✦ Arquitetura recomendada</div>
      <div className="win-name">{arch.label}</div>
      <div className="win-total">
        Total: ${fmtBRL(totalCosts[winner])}/mês · ${fmtBRL(second[1] - totalCosts[winner])} abaixo de {CONFIG.architectures[second[0]].label}
      </div>
      <div className="win-parts">
        <div>
          <span className="win-part-lbl">Infraestrutura</span>
          <span className="win-part-val real">${fmtBRL(infraCosts[winner])}/mês</span>
        </div>
        <div>
          <span className="win-part-lbl">Engenharia ajustada</span>
          <span className="win-part-val model">${fmtBRL(adjEngCosts[winner])}/mês</span>
        </div>
      </div>
    </div>
  )
}
