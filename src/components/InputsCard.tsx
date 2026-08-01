'use client'

import type { AppState, GrowthKey } from '@/lib/types'
import { CONFIG } from '@/lib/config'
import { sliderToRps, fmtBRL } from '@/lib/domain'

interface Props {
  state: AppState
  volDisplay: string
  onUpdate: (patch: Partial<AppState>) => void
}

const GROWTH_OPTIONS: { key: GrowthKey; label: string }[] = [
  { key: 'none',   label: 'Estável'    },
  { key: 'low',    label: '+10% a.a.'  },
  { key: 'medium', label: '+30% a.a.'  },
  { key: 'high',   label: '+60% a.a.'  },
]

function rpsToSlider(rps: number): number {
  return Math.round((Math.log(rps) - Math.log(1)) / (Math.log(1500) - Math.log(1)) * 100)
}

export default function InputsCard({ state, volDisplay, onUpdate }: Props) {
  const juniorCost  = Math.round(state.costPerDevJunior * state.seniorityFactor.junior)
  const plenoCost   = Math.round(state.costPerDevJunior * state.seniorityFactor.pleno)
  const seniorCost  = Math.round(state.costPerDevJunior * state.seniorityFactor.senior)
  const teamTotal   = state.teamComposition.junior + state.teamComposition.pleno + state.teamComposition.senior

  return (
    <div className="card">

      {/* BLOCO 1: Infraestrutura */}
      <div className="sec-lbl">Infraestrutura</div>

      <div className="field">
        <label>Pico de requisições por segundo (RPS)</label>
        <div className="slr-row">
          <input
            type="range"
            min="0" max="100" value={rpsToSlider(state.rps)}
            onChange={e => onUpdate({ rps: sliderToRps(parseInt(e.target.value)) })}
          />
          <span className="slr-val">{state.rps} req/s</span>
        </div>
        <div className="hint">
          Volume mensal derivado:{' '}
          <span className="mono" style={{ fontSize: 11 }}>~{volDisplay}/mês</span>
        </div>
      </div>

      <div className="field">
        <label>Crescimento esperado do projeto</label>
        <div className="seg">
          {GROWTH_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              className={state.growthKey === key ? 'on' : ''}
              onClick={() => onUpdate({ growthKey: key })}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="hint">Hipotético, aplicado ao RPS no gráfico de projeção.</div>
      </div>

      {/* BLOCO 2: Equipe */}
      <div className="section-divider">
        <span>Composição da equipe</span>
      </div>

      <div className="field">
        <label>Custo por desenvolvedor júnior (USD/mês, linha de base)</label>
        <div className="slr-row">
          <input
            type="range"
            min="500" max="20000" step="500"
            value={state.costPerDevJunior}
            onChange={e => onUpdate({ costPerDevJunior: parseInt(e.target.value) })}
          />
          <span className="slr-val">${fmtBRL(state.costPerDevJunior)}</span>
        </div>
        <div className="hint">Custo total ao empregador para nível júnior. Os outros níveis usam o fator de senioridade como multiplicador.</div>
      </div>

      <div className="field">
        <label>Quantidade de devs por nível</label>
        <div className="team-grid">

          {([
            { level: 'junior' as const, label: 'Júnior',  cost: juniorCost,  count: state.teamComposition.junior },
            { level: 'pleno'  as const, label: 'Pleno',   cost: plenoCost,   count: state.teamComposition.pleno  },
            { level: 'senior' as const, label: 'Sênior',  cost: seniorCost,  count: state.teamComposition.senior },
          ]).map(({ level, label, cost, count }) => (
            <div className="team-row" key={level}>
              <div className="team-row-lbl">
                {label}
                <small>${fmtBRL(cost)}/dev</small>
              </div>
              <input
                type="number"
                min="0"
                value={count}
                onChange={e => {
                  const v = parseInt(e.target.value)
                  if (!isNaN(v) && v >= 0) onUpdate({
                    teamComposition: { ...state.teamComposition, [level]: v }
                  })
                }}
                style={{
                  width: '60px',
                  fontFamily: "'DM Mono', monospace",
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'right',
                  border: '.5px solid var(--border)',
                  borderRadius: '6px',
                  padding: '.2rem .4rem',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                }}
              />
              <span />
            </div>
          ))}

        </div>
        <div className="team-total">
          <span>Total: <span>{teamTotal}</span> devs</span>
          <span className="team-total-val">
            Base mensal: ${fmtBRL(Math.round(
              state.teamComposition.junior * state.costPerDevJunior * state.seniorityFactor.junior +
              state.teamComposition.pleno  * state.costPerDevJunior * state.seniorityFactor.pleno  +
              state.teamComposition.senior * state.costPerDevJunior * state.seniorityFactor.senior
            ))}/mês
          </span>
        </div>
      </div>

    </div>
  )
}
