'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Tooltip, Legend,
  type TooltipItem,
} from 'chart.js'
import { CONFIG, ARCH_KEYS } from '@/lib/config'
import type { DomainResult } from '@/lib/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function CostChart({ result }: { result: DomainResult }) {
  const archDefs = CONFIG.architectures

  const data = {
    labels: ARCH_KEYS.map(k => archDefs[k].label),
    datasets: [
      {
        label: 'Infraestrutura (Azure · dados reais)',
        data: ARCH_KEYS.map(k => result.infraCosts[k]),
        backgroundColor: ARCH_KEYS.map(k => archDefs[k].color),
        stack: 'total',
        borderRadius: 0,
        borderSkipped: false as const,
      },
      {
        label: 'Engenharia (modelo paramétrico)',
        data: ARCH_KEYS.map(k => result.adjEngCosts[k]),
        backgroundColor: ARCH_KEYS.map(k => archDefs[k].color + '55'),
        borderColor:     ARCH_KEYS.map(k => archDefs[k].color),
        borderWidth: 1,
        stack: 'total',
        borderRadius: 4,
        borderSkipped: false as const,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label:  (c: TooltipItem<'bar'>) =>
            `${c.dataset.label ?? ''}: $${Math.round(c.parsed.y ?? 0).toLocaleString('pt-BR')}/mês`,
          footer: (items: TooltipItem<'bar'>[]) =>
            `Total: $${Math.round(items.reduce((s, i) => s + (i.parsed.y ?? 0), 0)).toLocaleString('pt-BR')}/mês`,
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
      y: {
        stacked: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          callback: (v: string | number) => '$' + (Number(v) >= 1000 ? (Number(v) / 1000).toFixed(0) + 'k' : String(v)),
          font: { size: 10 },
        },
      },
    },
  }

  return (
    <div className="card">
      <div className="sec-lbl">Custo mensal total: Infraestrutura + Engenharia</div>
      <div className="legend">
        {ARCH_KEYS.map(k => (
          <span key={k}>
            <span className="leg-i">
              <span className="leg-dot" style={{ background: archDefs[k].color }} />
              {archDefs[k].label} (infra)
            </span>
            {' '}
            <span className="leg-i">
              <span className="leg-dot" style={{
                background: archDefs[k].color + '55',
                border: `1px dashed ${archDefs[k].color}`,
              }} />
              {archDefs[k].label} (eng)
            </span>
          </span>
        ))}
      </div>
      <div className="chart-wrap" style={{ height: 240 }}>
        <Bar data={data} options={options} />
      </div>
      <p className="chart-note">
        Infra: interpolação log-linear sobre os três cenários de porte. Engenharia: modelo paramétrico (ajustável abaixo).
      </p>
    </div>
  )
}
