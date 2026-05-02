'use client'

import type { AppState, ArchKey } from '@/lib/types'
import { ARCH_KEYS } from '@/lib/config'

interface Props {
  state: AppState
  onUpdate: (patch: Partial<AppState>) => void
  onReset: () => void
}

export default function ModelParamsCard({ state, onUpdate, onReset }: Props) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="sec-lbl">Fatores do Modelo Paramétrico</div>

      <div className="callout" style={{ marginTop: 0 }}>
        Estes fatores <strong>não possuem valores universais na literatura de engenharia de software</strong>.
        Os defaults representam uma configuração inicial baseada em raciocínio qualitativo sobre complexidade
        relativa das arquiteturas (análogo a <em>effort multipliers</em> do COCOMO II — Boehm et al., 2000)
        e diferenças de produtividade de equipes distribuídas (Lei de Conway; Brook&apos;s Law).{' '}
        <strong>Ajuste conforme o contexto da sua equipe.</strong>
      </div>

      <div className="params-grid">

        {/* Fator de Senioridade */}
        <div>
          <div className="params-title">Fator de Senioridade</div>
          <p className="hint" style={{ marginBottom: '.75rem' }}>
            Multiplicador de custo em relação ao júnior (1,0). Reflete diferença salarial de mercado.
          </p>
          {([
            { level: 'junior' as const, label: 'Júnior',  disabled: true  },
            { level: 'pleno'  as const, label: 'Pleno',   disabled: false },
            { level: 'senior' as const, label: 'Sênior',  disabled: false },
          ]).map(({ level, label, disabled }) => (
            <div className="param-row" key={level}>
              <span className="param-lbl">{label}</span>
              <input
                type="range"
                min="0.5" max="3.0" step="0.05"
                value={state.seniorityFactor[level]}
                disabled={disabled}
                onChange={e => onUpdate({
                  seniorityFactor: { ...state.seniorityFactor, [level]: parseFloat(e.target.value) }
                })}
              />
              <span className="param-val">{state.seniorityFactor[level].toFixed(2)}×</span>
            </div>
          ))}
        </div>

        {/* Fator de Complexidade Arquitetural */}
        <div>
          <div className="params-title">Fator de Complexidade Arquitetural</div>
          <p className="hint" style={{ marginBottom: '.75rem' }}>
            Quanto mais complexa a arquitetura, maior o esforço de engenharia por dev. Monolito = 1,0 (linha de base absoluta).
          </p>
          {ARCH_KEYS.map(arch => (
            <div className="param-row" key={arch}>
              <span className="param-lbl">{arch === 'monolith' ? 'Monolito' : arch === 'serverless' ? 'Serverless' : 'Microsserviços'}</span>
              <input
                type="range"
                min="0.5" max="5.0" step="0.1"
                value={state.complexityFactor[arch]}
                onChange={e => onUpdate({
                  complexityFactor: { ...state.complexityFactor, [arch]: parseFloat(e.target.value) }
                })}
              />
              <span className="param-val">{state.complexityFactor[arch].toFixed(1)}×</span>
            </div>
          ))}
        </div>

        {/* Fator de Produtividade Arquitetural */}
        <div>
          <div className="params-title">Fator de Produtividade Arquitetural</div>
          <p className="hint" style={{ marginBottom: '.75rem' }}>
            Divide o custo de engenharia. Arquiteturas que permitem paralelismo de equipe entregam mais por dev. Monolito = 1,0.
          </p>
          {ARCH_KEYS.map(arch => (
            <div className="param-row" key={arch}>
              <span className="param-lbl">{arch === 'monolith' ? 'Monolito' : arch === 'serverless' ? 'Serverless' : 'Microsserviços'}</span>
              <input
                type="range"
                min="0.5" max="5.0" step="0.1"
                value={state.productivityFactor[arch]}
                onChange={e => onUpdate({
                  productivityFactor: { ...state.productivityFactor, [arch]: parseFloat(e.target.value) }
                })}
              />
              <span className="param-val">{state.productivityFactor[arch].toFixed(1)}×</span>
            </div>
          ))}
        </div>

      </div>

      {/* Limiar de equipe para microsserviços */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '.5px dashed var(--border)' }}>
        <div className="params-title">Equipe mínima para microsserviços (Lei de Conway)</div>
        <p className="hint" style={{ marginBottom: '.75rem' }}>
          Abaixo deste número de desenvolvedores, o fator de produtividade de microsserviços é reduzido
          gradualmente até 0,80 — equipes pequenas não formam times independentes suficientes para colher
          o benefício de paralelismo. Acima do limiar, o fator configurado é aplicado integralmente.
        </p>
        <div className="param-row">
          <span className="param-lbl">Limiar</span>
          <input
            type="range"
            min="2" max="15" step="1"
            value={state.microMinTeam}
            onChange={e => onUpdate({ microMinTeam: parseInt(e.target.value) })}
          />
          <span className="param-val">{state.microMinTeam} devs</span>
        </div>
      </div>

      {/* Tempo de ramp-up de velocidade */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '.5px dashed var(--border)' }}>
        <div className="params-title">Tempo de ramp-up (meses até velocidade plena)</div>
        <p className="hint" style={{ marginBottom: '.75rem' }}>
          Estimativa de quantos meses a equipe leva para atingir produtividade plena em cada arquitetura.
          Valor de referência inicial; ajuste conforme a experiência prévia da equipe com cada estilo.
        </p>
        {([
          { arch: 'monolith'      as ArchKey, label: 'Monolito'       },
          { arch: 'serverless'    as ArchKey, label: 'Serverless'     },
          { arch: 'microservices' as ArchKey, label: 'Microsserviços' },
        ]).map(({ arch, label }) => (
          <div className="param-row" key={arch}>
            <span className="param-lbl">{label}</span>
            <input
              type="range"
              min="1" max="24" step="1"
              value={state.velocityRampMonths[arch]}
              onChange={e => onUpdate({
                velocityRampMonths: { ...state.velocityRampMonths, [arch]: parseInt(e.target.value) }
              })}
            />
            <span className="param-val">{state.velocityRampMonths[arch]} m</span>
          </div>
        ))}
      </div>

      <button className="btn-reset" onClick={onReset}>↺ Restaurar valores default</button>
    </div>
  )
}
