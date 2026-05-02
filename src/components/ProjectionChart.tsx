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
  onUpdate: (patch: Partial<AppState>) => void
}

export default function ProjectionChart({ result, state, onUpdate }: Props) {
  const archDefs = CONFIG.architectures
  const months = Array.from({ length: state.projectionMonths }, (_, i) => `M${i + 1}`)

  const data = {
    labels: months,
    datasets: ARCH_KEYS.map(k => ({
      label: archDefs[k].label,
      data: result.projection.map(m => m[k]),
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
            `${c.dataset.label ?? ''}: $${Math.round(c.parsed.y ?? 0).toLocaleString('pt-BR')}/mês`,
        },
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          callback: (v: string | number) => '$' + (Number(v) >= 1000 ? (Number(v) / 1000).toFixed(0) + 'k' : String(v)),
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
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem', gap: '.75rem', flexWrap: 'wrap' }}>
        <div className="sec-lbl" style={{ marginBottom: 0 }}>
          Projeção de custo total — {state.projectionMonths} meses
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <input
            type="range"
            min="12" max="120" step="6"
            value={state.projectionMonths}
            onChange={e => onUpdate({ projectionMonths: parseInt(e.target.value) })}
            style={{ width: 120 }}
          />
          <span className="param-val" style={{ minWidth: 56, textAlign: 'right' }}>
            {state.projectionMonths} m
          </span>
        </div>
      </div>
      <div className="legend">
        {ARCH_KEYS.map(k => (
          <span key={k} className="leg-i">
            <span className="leg-dot" style={{ background: archDefs[k].color }} />
            {archDefs[k].label}
          </span>
        ))}
      </div>
      <div className="chart-wrap" style={{ height: 240 }}>
        <Line data={data} options={options} />
      </div>
      <p className="chart-note">
        Engenharia constante (equipe estável). Infraestrutura cresce com o RPS projetado.
        Microsserviços tende a crescer mais rápido porque sua infra escala de forma mais agressiva
        com o tráfego (múltiplos bancos, nodes AKS, barramento de mensagens). O ganho de longo prazo
        de microsserviços está na velocidade de entrega da equipe (gráfico abaixo), não no custo de infra.
        Selecione crescimento &quot;Estável&quot; para isolar os custos fixos.
      </p>
    </div>
  )
}
