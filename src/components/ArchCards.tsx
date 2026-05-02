import { CONFIG, ARCH_KEYS } from '@/lib/config'
import { fmtBRL } from '@/lib/domain'
import type { DomainResult } from '@/lib/types'

export default function ArchCards({ result }: { result: DomainResult }) {
  const { totalCosts, infraCosts, adjEngCosts, effectiveRatios, winner } = result
  const sorted = Object.entries(totalCosts).sort((a, b) => a[1] - b[1]) as [keyof typeof totalCosts, number][]
  const maxTotal = sorted[sorted.length - 1][1]

  return (
    <div className="arch3">
      {sorted.map(([key, total]) => {
        const arch     = CONFIG.architectures[key]
        const barWidth = Math.round((total / maxTotal) * 100)
        const ratio    = effectiveRatios[key]
        const isWinner = key === winner
        return (
          <div
            key={key}
            className={`a-card${isWinner ? ' top' : ''}`}
            style={{
              borderLeftColor: arch.color,
              ...(isWinner ? { borderColor: arch.color } : {}),
            }}
          >
            <div className="a-name">{arch.label}</div>
            <div className="a-bar">
              <div className="a-bar-fill" style={{ width: `${barWidth}%`, background: arch.color }} />
            </div>
            <div className="a-total" style={{ color: arch.color }}>${fmtBRL(total)}</div>
            <div className="a-parts">
              <div className="a-part"><span>Infra</span><span>${fmtBRL(infraCosts[key])}</span></div>
              <div className="a-part"><span>Eng</span><span>${fmtBRL(adjEngCosts[key])}</span></div>
            </div>
            <span className="a-ratio">ratio={ratio.toFixed(2)}×</span>
          </div>
        )
      })}
    </div>
  )
}
