'use client'

import type { AppState, ArchKey } from '@/lib/types'
import { ARCH_KEYS, CONFIG } from '@/lib/config'

interface Props {
  state: AppState
  onUpdate: (patch: Partial<AppState>) => void
  onReset: () => void
}

interface SliderRowProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  disabled?: boolean
  onChange: (value: number) => void
  formatValue: (value: number) => string
}

function SliderRow({ label, value, min, max, step, disabled, onChange, formatValue }: SliderRowProps) {
  return (
    <div className="param-row">
      <span className="param-lbl">{label}</span>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
      <span className="param-val">{formatValue(value)}</span>
    </div>
  )
}

const archLabel = (arch: ArchKey) => CONFIG.architectures[arch].label
const asMultiplier = (v: number) => `${v.toFixed(1)}×`
const RAMP_ORDER: ArchKey[] = ['monolith', 'serverless', 'microservices']

export default function ModelParamsCard({ state, onUpdate, onReset }: Props) {
  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="sec-lbl">Fatores do Modelo Paramétrico</div>

      <div className="callout" style={{ marginTop: 0 }}>
        Estes fatores <strong>não possuem valores universais na literatura de engenharia de software</strong>.
        Os defaults representam uma configuração inicial baseada em raciocínio qualitativo sobre complexidade
        relativa das arquiteturas (análogo a <em>effort multipliers</em> do COCOMO II, Boehm et al. 2000)
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
            <SliderRow
              key={level}
              label={label}
              min={0.5} max={3.0} step={0.05}
              value={state.seniorityFactor[level]}
              disabled={disabled}
              onChange={v => onUpdate({ seniorityFactor: { ...state.seniorityFactor, [level]: v } })}
              formatValue={v => v.toFixed(2) + '×'}
            />
          ))}
        </div>

        {/* Fator de Complexidade Arquitetural */}
        <div>
          <div className="params-title">Fator de Complexidade Arquitetural</div>
          <p className="hint" style={{ marginBottom: '.75rem' }}>
            Quanto mais complexa a arquitetura, maior o esforço de engenharia por dev. Monolito = 1,0 (linha de base absoluta).
          </p>
          {ARCH_KEYS.map(arch => (
            <SliderRow
              key={arch}
              label={archLabel(arch)}
              min={0.5} max={5.0} step={0.1}
              value={state.complexityFactor[arch]}
              onChange={v => onUpdate({ complexityFactor: { ...state.complexityFactor, [arch]: v } })}
              formatValue={asMultiplier}
            />
          ))}
        </div>

        {/* Fator de Produtividade Arquitetural */}
        <div>
          <div className="params-title">Fator de Produtividade Arquitetural</div>
          <p className="hint" style={{ marginBottom: '.75rem' }}>
            Divide o custo de engenharia. Arquiteturas que permitem paralelismo de equipe entregam mais por dev. Monolito = 1,0.
          </p>
          {ARCH_KEYS.map(arch => (
            <SliderRow
              key={arch}
              label={archLabel(arch)}
              min={0.5} max={5.0} step={0.1}
              value={state.productivityFactor[arch]}
              onChange={v => onUpdate({ productivityFactor: { ...state.productivityFactor, [arch]: v } })}
              formatValue={asMultiplier}
            />
          ))}
        </div>

      </div>

      {/* Limiar de equipe para microsserviços e serverless */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '.5px dashed var(--border)' }}>
        <div className="params-title">Equipe mínima por arquitetura (Lei de Conway)</div>
        <p className="hint" style={{ marginBottom: '.75rem' }}>
          Um time stream-aligned (Skelton &amp; Pais, 2019) precisa de pelo menos este número de devs.
          Abaixo dele, microsserviços perde produtividade (sem times independentes suficientes) e
          serverless <strong>ganha</strong> produtividade (menos infra dedicada para administrar por dev).
          Acima dele, o fator de produtividade de serverless configurado é aplicado integralmente.
        </p>
        <SliderRow
          label="Limiar (N_min)"
          min={2} max={15} step={1}
          value={state.microMinTeam}
          onChange={v => onUpdate({ microMinTeam: v })}
          formatValue={v => `${v} devs`}
        />

        <p className="hint" style={{ margin: '.75rem 0' }}>
          Microsserviços só entrega o fator de produtividade configurado integralmente quando a equipe
          atinge um múltiplo do limiar acima: uma equipe de exatamente N_min pessoas forma só um time,
          e o ganho de paralelismo exige times independentes múltiplos.
        </p>
        <SliderRow
          label="Múltiplo p/ benefício pleno"
          min={1} max={4} step={0.5}
          value={state.microFullBenefitMultiplier}
          onChange={v => onUpdate({ microFullBenefitMultiplier: v })}
          formatValue={v => `${v.toFixed(1)}× (${Math.round(state.microMinTeam * v)} devs)`}
        />

        <p className="hint" style={{ margin: '.75rem 0' }}>
          Produtividade de serverless para uma equipe de 1 dev (decai linearmente até o valor configurado
          no limiar N_min). Reflete que eliminar a operação de infraestrutura vale mais quando não há
          ninguém "sobrando" na equipe para cuidar disso (Roberts &amp; Chapin, 2020).
        </p>
        <SliderRow
          label="Produtividade máx. serverless"
          min={1.2} max={3.0} step={0.1}
          value={state.srvProdMaxSmallTeam}
          onChange={v => onUpdate({ srvProdMaxSmallTeam: v })}
          formatValue={asMultiplier}
        />
      </div>

      {/* Tempo de ramp-up de velocidade */}
      <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '.5px dashed var(--border)' }}>
        <div className="params-title">Tempo de ramp-up (meses até velocidade plena)</div>
        <p className="hint" style={{ marginBottom: '.75rem' }}>
          Estimativa de quantos meses a equipe leva para atingir produtividade plena em cada arquitetura.
          Valor de referência inicial; ajuste conforme a experiência prévia da equipe com cada estilo.
        </p>
        {RAMP_ORDER.map(arch => (
          <SliderRow
            key={arch}
            label={archLabel(arch)}
            min={1} max={24} step={1}
            value={state.velocityRampMonths[arch]}
            onChange={v => onUpdate({ velocityRampMonths: { ...state.velocityRampMonths, [arch]: v } })}
            formatValue={v => `${v} m`}
          />
        ))}
      </div>

      <button className="btn-reset" onClick={onReset}>↺ Restaurar valores default</button>
    </div>
  )
}
