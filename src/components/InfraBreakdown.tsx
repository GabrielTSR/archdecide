'use client'

import { Fragment } from 'react'
import { CONFIG, ARCH_KEYS } from '@/lib/config'
import type { BreakdownTab } from '@/lib/types'
import { fmtBRL, fmtVolume } from '@/lib/domain'

interface Props {
  activeTab: BreakdownTab
  onTabChange: (tab: BreakdownTab) => void
}

const TABS: { key: BreakdownTab; label: string }[] = [
  { key: 'small',  label: 'Pequeno porte · 2 req/s'       },
  { key: 'medium', label: 'Médio porte · 80 req/s'         },
  { key: 'large',  label: 'Grande porte · 1.500 req/s'     },
]

export default function InfraBreakdown({ activeTab, onTabChange }: Props) {
  const scenInfo = CONFIG.scenarios[activeTab]
  const bdata    = CONFIG.infrastructureBreakdown[activeTab]

  const headerText =
    `${scenInfo.label} · ${scenInfo.rps} req/s · ` +
    `${scenInfo.users.toLocaleString('pt-BR')} usuários simult. (contexto) · ` +
    `${fmtVolume(scenInfo.volumeMonth)}/mês`

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div className="sec-lbl">Detalhamento de serviços Azure</div>
      <div className="callout callout-ok" style={{ marginBottom: '1.1rem' }}>
        Valores em USD. Fonte: Azure Pricing Calculator (abr/2026), preços de tabela sem descontos ou reservas.
      </div>

      <div className="tabs">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`tab${activeTab === key ? ' on' : ''}`}
            onClick={() => onTabChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: '11.5px', color: 'var(--muted)', marginBottom: '1.25rem' }}>{headerText}</p>

      {ARCH_KEYS.map(archKey => {
        const arch = CONFIG.architectures[archKey]
        const info = bdata[archKey]
        let lastSection: string | null = null

        return (
          <div key={archKey} style={{ marginBottom: '2rem' }}>
            <div className="arch-hdr">
              <div className="arch-dot" style={{ background: arch.color }} />
              <span className="arch-ttl">{arch.label}</span>
              <span className="arch-total">${fmtBRL(info.totalUsd)}/mês</span>
            </div>
            <div className="bt-wrap">
              <table className="bt">
                <thead>
                  <tr>
                    <th>Recurso Azure</th>
                    <th>SKU / Tier</th>
                    <th>Quantidade</th>
                    <th>$/mês</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {info.rows.map((row, i) => {
                    const showSection = row.section !== lastSection
                    if (showSection) lastSection = row.section
                    return (
                      <Fragment key={i}>
                        {showSection && (
                          <tr className="row-sec">
                            <td colSpan={5}>{row.section}</td>
                          </tr>
                        )}
                        <tr>
                          <td>{row.name}</td>
                          <td className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{row.sku}</td>
                          <td className="mono" style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{row.qty}</td>
                          <td className="mono">${row.usd}</td>
                          <td className="note-c">{row.note}</td>
                        </tr>
                      </Fragment>
                    )
                  })}
                  <tr className="row-tot">
                    <td colSpan={3}>Total estimado mensal</td>
                    <td>${info.totalUsd}</td>
                    <td className="note-c">Fonte: Azure Pricing Calculator, abr/2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
