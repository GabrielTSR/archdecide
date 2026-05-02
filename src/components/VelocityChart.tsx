'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend,
  type TooltipItem,
} from 'chart.js'
import { CONFIG, ARCH_KEYS } from '@/lib/config'
import type { DomainResult, AppState } from '@/lib/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface Props {
  result: DomainResult
  state: AppState
}

export default function VelocityChart({ result, state }: Props) {
  const archDefs = CONFIG.architectures
  const months = Array.from({ length: state.projectionMonths }, (_, i) => `M${i + 1}`)

  const data = {
    labels: months,
    datasets: ARCH_KEYS.map(k => ({
      label: archDefs[k].label,
      data: result.velocityProjection.map(m => m[k]),
      borderColor: archDefs[k].color,
      backgroundColor: 'transparent',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.3,
    })),
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c: TooltipItem<'line'>) =>
            `${c.dataset.label ?? ''}: ${(c.parsed.y ?? 0).toFixed(2)} entregas/mês`,
        },
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        beginAtZero: true,
        ticks: {
          callback: (v: string | number) => Number(v).toFixed(1),
          font: { size: 10 },
        },
      },
      x: {
        grid: { display: false },
        ticks: { autoSkip: true, maxTicksLimit: 12, font: { size: 10 } },
      },
    },
  }

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="sec-lbl">
        Velocidade de entrega ao longo de {state.projectionMonths} meses
      </div>
      <div className="legend">
        {ARCH_KEYS.map(k => (
          <span key={k} className="leg-i">
            <span className="leg-dot" style={{ background: archDefs[k].color }} />
            {archDefs[k].label}
            <span style={{ color: 'var(--muted)', fontSize: 10, marginLeft: 4 }}>
              (ramp {state.velocityRampMonths[k]}m, regime: {result.steadyVelocity[k].toFixed(2)})
            </span>
          </span>
        ))}
      </div>
      <div className="chart-wrap" style={{ height: 240 }}>
        <Line data={data} options={options} />
      </div>
      <p className="chart-note">
        Velocidade em equivalentes de dev-monolito por mês. O ramp-up é um valor de referência
        calibrável: {state.velocityRampMonths.monolith} mês para monolito,
        {' '}{state.velocityRampMonths.serverless} meses para serverless,
        {' '}{state.velocityRampMonths.microservices} meses para microsserviços — ajuste no painel
        &quot;Fatores do Modelo Paramétrico&quot; conforme a experiência prévia da equipe.
        O patamar final usa o ratio efetivo, que aplica a penalidade quando a equipe está abaixo
        do limiar de microsserviços. Se microsserviços aparece abaixo das demais arquiteturas,
        verifique o tamanho da equipe: abaixo do limiar configurado, o overhead de gestão de
        múltiplos serviços tende a superar o ganho de paralelismo.
      </p>
    </div>
  )
}
