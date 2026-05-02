'use client'

import { useState } from 'react'
import type { AppState } from '@/lib/types'

interface AccordionItem {
  title: string
  content: React.ReactNode
}

function AccordionEntry({ title, content }: AccordionItem) {
  const [open, setOpen] = useState(false)
  return (
    <div className="acc-i">
      <button className="acc-h" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        <span className={`arr${open ? ' open' : ''}`}>▼</span>
      </button>
      <div className={`acc-b${open ? ' open' : ''}`}>{content}</div>
    </div>
  )
}

interface Props {
  onApply?: (patch: Partial<AppState>) => void
}

export default function MethodologyAccordion({ onApply }: Props) {
  const ITEMS: AccordionItem[] = [
    {
      title: '1. Por que a escolha de arquitetura tem impacto financeiro direto',
      content: (
        <>
          <p style={{ marginBottom: '.75rem' }}>
            A arquitetura de software não é só uma decisão técnica. Ela determina quanto a empresa
            vai gastar todo mês em infraestrutura e quanto cada desenvolvedor vai custar em produtividade real.
            Três situações recorrentes no mercado ilustram isso:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '.75rem' }}>
            <div className="callout">
              <strong>Startup com 2 devs adota microsserviços</strong>
              <p style={{ marginTop: '.25rem', fontSize: '12.5px' }}>
                Inspirados por cases de grandes empresas, 2 desenvolvedores implementam microsserviços.
                Passam 70% do tempo configurando Kubernetes, service discovery e pipelines de CI/CD
                ao invés de desenvolver o produto. A infraestrutura custa 3x mais que um monolito equivalente.
                O runway acaba antes da validação do produto.
              </p>
            </div>
            <div className="callout">
              <strong>E-commerce com monolito atinge o limite de escala</strong>
              <p style={{ marginTop: '.25rem', fontSize: '12.5px' }}>
                Uma plataforma cresce de 5 para 300 req/s em 18 meses. O monolito começa a apresentar
                gargalos: um deploy interrompe tudo, adicionar desenvolvedores aumenta o custo de
                coordenação exponencialmente (Lei de Brooks), e a base de código se torna frágil.
                Migrar para microsserviços nesse estágio custa 3x mais do que teria custado desde o início
                com uma equipe adequada.
              </p>
            </div>
            <div className="callout">
              <strong>SaaS B2B com tráfego pontual subestima o serverless</strong>
              <p style={{ marginTop: '.25rem', fontSize: '12.5px' }}>
                Um sistema com picos comerciais (8h às 18h) e tráfego próximo de zero à noite
                usa serverless e economiza 40% em relação ao monolito dimensionado para o pico.
                Porém, ao atingir 80 req/s sustentados, o plano de consumo se torna inviável
                e a migração para plano premium dobra o custo inesperadamente.
              </p>
            </div>
          </div>
          <p>
            Este modelo quantifica esse tradeoff em uma métrica única: <strong>custo total mensal</strong>,
            combinando dados reais de infraestrutura de nuvem com um modelo paramétrico de custo de engenharia.
          </p>
        </>
      ),
    },
    {
      title: '2. A fórmula geral',
      content: (
        <>
          <pre className="formula">{`Custo Total[arquitetura] = Infraestrutura[arquitetura]  +  Engenharia[arquitetura]
                                         ↑                            ↑
                                  dados reais de nuvem        modelo paramétrico
                                  (interpolado por RPS)        (equipe × fatores)`}</pre>
          <p style={{ marginTop: '.5rem' }}>
            A arquitetura com <strong>menor Custo Total</strong> é a recomendada.
            Ambos os componentes são somados diretamente em USD/mês, com peso igual.
          </p>
        </>
      ),
    },
    {
      title: '3. Custo de infraestrutura',
      content: (
        <>
          <p style={{ marginBottom: '.5rem' }}>
            Baseado em cotações reais de nuvem pública para três portes de sistema.
            Para RPS entre os portes, a interpolação é log-linear (crescimento exponencial de tráfego
            corresponde a crescimento linear em escala logarítmica).
          </p>
          <pre className="formula">{`Âncoras (dados reais de nuvem, preços de tabela sem reservas):

  Porte    |    RPS  |  Monolito  |  Microsserviços  |  Serverless
  ──────────────────────────────────────────────────────────────────
  Pequeno  |      2  |      $108  |            $489  |         $15
  Médio    |     80  |    $1.138  |          $1.498  |        $125
  Grande   |  1.500  |    $4.242  |          $9.319  |      $2.011

Interpolação log-linear para RPS intermediário:
  t     = (ln(rps) − ln(rps_inf)) / (ln(rps_sup) − ln(rps_inf))
  custo = custo_inf  +  t × (custo_sup − custo_inf)`}</pre>
        </>
      ),
    },
    {
      title: '4. Custo de engenharia, passo a passo',
      content: (
        <>
          <div className="callout" style={{ marginTop: 0 }}>
            Modelo paramétrico independente dos dados de infraestrutura. Todos os fatores são calibráveis
            nos controles da seção "Fatores do Modelo Paramétrico".
          </div>

          <p style={{ fontWeight: 600, marginBottom: '.4rem' }}>Passo 1 — base da equipe</p>
          <pre className="formula">{`Base = Σ por nível [ quantidade × custo_júnior × fator_senioridade ]

  Fatores padrão (mercado brasileiro 2025):
    Júnior:  1,0  (custo base ~$1.200/mês, total CLT ~R$6.720)
    Pleno:   2,0  (custo ~$2.400/mês, salário CLT ~R$8.400)
    Sênior:  3,5  (custo ~$4.200/mês, salário CLT ~R$14.700)`}</pre>

          <p style={{ fontWeight: 600, margin: '.75rem 0 .4rem' }}>Passo 2 — limiar de equipe para microsserviços</p>
          <pre className="formula">{`Abaixo do limiar configurado (padrão: 5 devs), o fator de produtividade
de microsserviços é reduzido linearmente de 0,80 (1 dev) até o valor
configurado (no limiar). Isso reflete o overhead real de um time pequeno
gerenciando múltiplos serviços, pipelines e infraestrutura distribuída.

  Exemplo: 2 devs, limiar 5:
    t = (2 − 1) / (5 − 1) = 0,25
    pf efetivo = 0,80 + 0,25 × (2,10 − 0,80) = 1,125`}</pre>

          <p style={{ fontWeight: 600, margin: '.75rem 0 .4rem' }}>Passo 3 — ajuste por arquitetura</p>
          <pre className="formula">{`Engenharia[arq] = Base × (complexidade[arq] / produtividade[arq])

  Fatores padrão:
    Monolito:       complexidade 1,0  /  produtividade 1,0  =  ratio 1,000
    Serverless:     complexidade 1,3  /  produtividade 1,2  =  ratio 1,083
    Microsserviços: complexidade 2,0  /  produtividade 2,5  =  ratio 0,800 (acima do limiar)

  ratio < 1,0: arquitetura mais barata em engenharia que o monolito
  ratio > 1,0: arquitetura mais cara em engenharia que o monolito

  Velocidade de entrega = inverso do ratio efetivo:
    Monolito:       1 / 1,000 = 1,00 dev-eq/mês por dev
    Serverless:     1 / 1,083 = 0,92 dev-eq/mês por dev
    Microsserviços: 1 / 0,800 = 1,25 dev-eq/mês por dev (acima do limiar)`}</pre>
        </>
      ),
    },
    {
      title: '5. Três cenários de referência com dados de entrada',
      content: (
        <>
          <div className="callout" style={{ marginTop: 0 }}>
            Cada cenário abaixo apresenta os valores de entrada considerados.
            O botão <strong>Aplicar cenário</strong> carrega esses valores nos controles para análise interativa nos gráficos.
            Os fatores do modelo permanecem como configurados pelo analista.
          </div>

          {/* Cenário 1: Monolito */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.4rem', flexWrap: 'wrap' }}>
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#185FA5', flexShrink:0 }} />
              <span style={{ fontWeight: 700, fontSize: '13px' }}>Monolito vence</span>
              {onApply && (
                <button
                  className="btn-reset"
                  style={{ marginLeft: 'auto', marginBottom: 0 }}
                  onClick={() => {
                    onApply({ rps: 2, teamComposition: { junior: 2, pleno: 0, senior: 0 } })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ↗ Aplicar cenário
                </button>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '.5rem', lineHeight: 1.5 }}>
              Startup em fase inicial com dois desenvolvedores juniores e tráfego mínimo.
              Com 2 devs abaixo do limiar de 5, o fator de produtividade efetivo de microsserviços
              cai para 1,125, tornando-o significativamente mais caro. O monolito entrega o menor
              custo com a menor complexidade operacional.
            </p>
            <pre className="formula">{`Inputs utilizados:
  RPS: 2  (âncora pequeno porte)
  Equipe: 2 juniores
  Custo por dev júnior: $1.200/mês
  Fator de senioridade: júnior = 1,0
  Limiar de equipe para micro: 5 devs
  Fatores de complexidade: mono 1,0  /  srv 1,3  /  micro 2,0
  Fatores de produtividade: mono 1,0  /  srv 1,2  /  micro 2,5

Cálculo:
  Base da equipe = 2 × $1.200 × 1,0 = $2.400/mês
  Produtividade efetiva (micro): t=(2−1)/(5−1)=0,25
                                 pf = 0,80 + 0,25×(2,5−0,80) = 1,225
                                 ratio = 2,0 / 1,225 = 1,633

  Arquitetura       Infra             Engenharia       Total/mês
  ──────────────────────────────────────────────────────────────
  Monolito        $    108   +   $  2.400   =   $  2.508   << MENOR CUSTO
  Serverless      $     15   +   $  2.600   =   $  2.615
  Microsserviços  $    489   +   $  3.919   =   $  4.408   [ratio efetivo 1,633]`}</pre>
          </div>

          {/* Cenário 2: Serverless */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.4rem', flexWrap: 'wrap' }}>
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#0F6E56', flexShrink:0 }} />
              <span style={{ fontWeight: 700, fontSize: '13px' }}>Serverless vence</span>
              {onApply && (
                <button
                  className="btn-reset"
                  style={{ marginLeft: 'auto', marginBottom: 0 }}
                  onClick={() => {
                    onApply({ rps: 80, teamComposition: { junior: 1, pleno: 0, senior: 0 } })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ↗ Aplicar cenário
                </button>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '.5rem', lineHeight: 1.5 }}>
              Desenvolvedor solo com tráfego moderado (80 req/s). A infraestrutura gerenciada do serverless
              custa $1.013/mês a menos que o monolito nessa faixa de RPS. Esse ganho supera o overhead
              de engenharia serverless ($100/mês extra). Contexto: tráfego variável ou de pico pontual.
              Em carga constante e muito alta, o plano de consumo se torna inviável e o plano premium
              reduz ou elimina essa vantagem.
            </p>
            <pre className="formula">{`Inputs utilizados:
  RPS: 80  (âncora médio porte)
  Equipe: 1 junior
  Custo por dev júnior: $1.200/mês
  Fator de senioridade: júnior = 1,0
  Limiar de equipe para micro: 5 devs
  Fatores de complexidade: mono 1,0  /  srv 1,3  /  micro 2,0
  Fatores de produtividade: mono 1,0  /  srv 1,2  /  micro 2,5

Cálculo:
  Base da equipe = 1 × $1.200 × 1,0 = $1.200/mês
  Produtividade efetiva (micro): 1 dev = piso de 0,80 (abaixo do limiar)
                                 ratio = 2,0 / 0,80 = 2,500

  Arquitetura       Infra             Engenharia       Total/mês
  ──────────────────────────────────────────────────────────────
  Serverless      $    125   +   $  1.300   =   $  1.425   << MENOR CUSTO
  Monolito        $  1.138   +   $  1.200   =   $  2.338
  Microsserviços  $  1.498   +   $  3.000   =   $  4.498   [ratio efetivo 2,500]`}</pre>
          </div>

          {/* Cenário 3: Microsserviços */}
          <div style={{ marginBottom: '.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.4rem', flexWrap: 'wrap' }}>
              <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#C95230', flexShrink:0 }} />
              <span style={{ fontWeight: 700, fontSize: '13px' }}>Microsserviços vence</span>
              {onApply && (
                <button
                  className="btn-reset"
                  style={{ marginLeft: 'auto', marginBottom: 0 }}
                  onClick={() => {
                    onApply({ rps: 80, teamComposition: { junior: 0, pleno: 8, senior: 0 } })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  ↗ Aplicar cenário
                </button>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '.5rem', lineHeight: 1.5 }}>
              Empresa em crescimento com 8 desenvolvedores plenos, acima do limiar de 5.
              Times stream-aligned por domínio (Skelton & Pais, "Team Topologies") reduzem
              o custo efetivo de engenharia em 20%. Com base de $19.200/mês, a economia
              de engenharia de $3.840/mês supera o prêmio de infraestrutura de $360/mês.
              Vantagem em velocidade: 10,00 vs 8,00 entregas/mês (25% acima do monolito).
            </p>
            <pre className="formula">{`Inputs utilizados:
  RPS: 80  (âncora médio porte)
  Equipe: 8 plenos
  Custo por dev júnior: $1.200/mês
  Fator de senioridade: pleno = 2,0
  Limiar de equipe para micro: 5 devs
  Fatores de complexidade: mono 1,0  /  srv 1,3  /  micro 2,0
  Fatores de produtividade: mono 1,0  /  srv 1,2  /  micro 2,5

Cálculo:
  Base da equipe = 8 × $1.200 × 2,0 = $19.200/mês
  Produtividade efetiva (micro): 8 devs >= limiar 5, pf = 2,5 integral
                                 ratio = 2,0 / 2,5 = 0,800

  Arquitetura       Infra             Engenharia       Total/mês
  ──────────────────────────────────────────────────────────────
  Microsserviços  $  1.498   +   $ 15.360   =   $ 16.858   << MENOR CUSTO
  Monolito        $  1.138   +   $ 19.200   =   $ 20.338
  Serverless      $    125   +   $ 20.800   =   $ 20.925`}</pre>
          </div>
        </>
      ),
    },
    {
      title: '6. O limiar de equipe e por que o tamanho do time é o fator decisivo',
      content: (
        <>
          <p>O modelo revela que a arquitetura recomendada é mais sensível ao tamanho da equipe do que ao volume de tráfego:</p>
          <pre className="formula">{`Abaixo do limiar (padrão: 5 devs):
  O fator de produtividade de microsserviços é interpolado de 0,80 (1 dev)
  até o valor configurado (no limiar). Microsserviços perde na maioria dos casos.
  Motivo: times pequenos não formam squads independentes por domínio.
  Um dev gerenciando 4 serviços tem overhead constante, não ganho de paralelismo.

Acima do limiar:
  O fator configurado é aplicado integralmente. Microsserviços pode vencer
  quando a economia de engenharia supera o prêmio de infraestrutura.
  Isso ocorre em cargas médias com equipes grandes.

Em cargas muito altas (próximo de 1.500 req/s):
  A infraestrutura de microsserviços escala de forma mais agressiva
  (AKS nodes, Cosmos DB por serviço, Service Bus Premium).
  O prêmio de infra supera a economia de engenharia mesmo para equipes grandes.
  Serverless ou monolito tendem a vencer nessa faixa.`}</pre>
          <p style={{ marginTop: '.75rem' }}>
            Ajuste o limiar no painel "Fatores do Modelo Paramétrico" e observe a mudança de recomendação.
          </p>
        </>
      ),
    },
    {
      title: '7. Modelo de velocidade de entrega e por que microsserviços pode perder',
      content: (
        <>
          <p style={{ marginBottom: '.5rem' }}>
            A velocidade de entrega é derivada do mesmo ratio efetivo do custo de engenharia,
            mas usando seu inverso (ratio menor implica mais output por dev):
          </p>
          <pre className="formula">{`velocidade[arq] = devs_totais  ×  ( produtividade[arq] / complexidade[arq] )
                                  ──────────────────────────────────────
                                          1 / ratio efetivo

A unidade é "equivalente de dev-monolito por mês":
  1,00 = mesma produtividade do monolito de referência
  1,25 = 25% mais output por dev (estimativa para microsserviços acima do limiar)
  0,40 = 60% menos output por dev (estimativa para microsserviços com 1 dev solo)`}</pre>
          <div className="callout" style={{ marginTop: '.75rem' }}>
            <strong>Estes são valores de referência calibráveis,</strong> não fatos estabelecidos.
            O tempo de ramp-up e os fatores de produtividade dependem do contexto de cada equipe:
            experiência prévia, maturidade em DevOps, disponibilidade de plataforma interna.
            Ajuste no painel &quot;Fatores do Modelo Paramétrico&quot; para refletir a realidade do projeto.
          </div>
          <p style={{ margin: '.75rem 0 .5rem', fontWeight: 600 }}>
            Por que microsserviços perde em velocidade nas configurações padrão?
          </p>
          <p style={{ marginBottom: '.5rem' }}>
            A configuração padrão (1 júnior + 2 plenos = 3 devs) está
            <strong> abaixo do limiar de 5 devs </strong> para microsserviços. Nessa faixa,
            o fator de produtividade é reduzido de 0,80 (1 dev) até 2,5 (no limiar).
            Com 3 devs, o ratio efetivo sobe e a velocidade fica abaixo do monolito.
            O raciocínio: equipes pequenas gerenciando múltiplos serviços tendem a ter
            overhead constante sem o ganho de paralelismo de times independentes por domínio.
          </p>
          <p>
            Aumentando a equipe para 8 plenos (acima do limiar), microsserviços passa a
            ter velocidade maior que o monolito conforme o fator de produtividade configurado.
            Aplique o cenário 5.3 acima para verificar. O ramp-up de {'{'}9{'}'} meses
            (valor padrão ajustável) modela o tempo de setup inicial, não o regime permanente.
          </p>
        </>
      ),
    },
    {
      title: '8. Fundamento acadêmico e fontes',
      content: (
        <>
          <p style={{ marginBottom: '.5rem' }}>
            Os fatores de complexidade, produtividade, limiar de equipe e curva de ramp-up
            não têm valores universais — dependem do contexto, da equipe e da organização.
            Os valores de referência deste modelo são estimativas informadas pelas obras abaixo,
            mas devem ser tratados como ponto de partida para calibração, não como verdades estabelecidas:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '12.5px' }}>
            <div>
              <strong>Conway, M. (1968)</strong> &quot;How Do Committees Invent?&quot;,
              <em> Datamation</em>. Princípio de que sistemas espelham a estrutura de comunicação
              da organização. Justifica o limiar de equipe: sem times independentes, microsserviços
              replica fronteiras inexistentes.
            </div>
            <div>
              <strong>Brooks, F. (1975)</strong> &quot;The Mythical Man-Month&quot;, Addison-Wesley.
              Lei de Brooks: overhead de comunicação cresce em O(n²) com o tamanho do time.
              Justifica o ganho de paralelismo de microsserviços para times grandes.
            </div>
            <div>
              <strong>Boehm, B. et al. (2000)</strong> &quot;Software Cost Estimation with COCOMO II&quot;,
              Prentice Hall. Modelo paramétrico de esforço com effort multipliers calibráveis.
              Base metodológica para o modelo de engenharia adotado.
            </div>
            <div>
              <strong>Forsgren, N., Humble, J., Kim, G. (2018)</strong> &quot;Accelerate: The Science
              of Lean Software and DevOps&quot;, IT Revolution Press. Estudo empírico (DORA)
              correlacionando práticas DevOps com performance organizacional. Referência qualitativa
              para o potencial de ganho de microsserviços com maturidade DevOps; o fator de
              produtividade padrão (2,5) é uma estimativa calibrável, não um valor universal.
            </div>
            <div>
              <strong>Skelton, M., Pais, M. (2019)</strong> &quot;Team Topologies&quot;,
              IT Revolution Press. Define stream-aligned teams (5 a 9 pessoas por fluxo de valor).
              Base do limiar mínimo de 5 desenvolvedores para microsserviços.
            </div>
            <div>
              <strong>Soldani, J., Tamburri, D. A., Heuvel, W. (2018)</strong> &quot;The Pains
              and Gains of Microservices: A Systematic Grey Literature Review&quot;, JSS.
              Síntese de evidências industriais sobre overhead inicial e ganhos de longo prazo.
              Referência qualitativa para a ordem de grandeza do ramp-up de microsserviços
              (o valor exato é calibrável no modelo).
            </div>
            <div>
              <strong>Fritzsch, J., Bogner, J., Wagner, S., Zimmermann, A. (2019)</strong>
              &quot;Microservices Migration in Industry: Intentions, Strategies, and Challenges&quot;,
              IEEE ICSME. Estudo de campo com 14 empresas. Relata variação de 6 a 18 meses
              até produtividade plena, o que ilustra por que o ramp-up deve ser ajustado
              ao contexto da equipe, não tratado como constante.
            </div>
            <div>
              <strong>Roberts, M., Chapin, J. (2020)</strong> &quot;Programming AWS Lambda&quot;,
              O&apos;Reilly. Discussão prática de cold start, debug distribuído e limites de plano
              em serverless. Referência qualitativa para o overhead de serverless; o fator de
              complexidade e o ramp-up são calibráveis no modelo.
            </div>
            <div>
              <strong>Newman, S. (2021)</strong> &quot;Building Microservices&quot;, 2nd ed.,
              O&apos;Reilly. Tradeoffs canônicos de microsserviços. Referência para fatores
              de complexidade e produtividade.
            </div>
          </div>
          <pre className="formula" style={{ marginTop: '.75rem' }}>{`Valores de referência iniciais (todos ajustáveis nos controles do modelo):

  complexityFactor:               productivityFactor:
    Monolito       : 1,0            Monolito       : 1,0
    Serverless     : 1,3            Serverless     : 1,2
    Microsserviços : 2,0            Microsserviços : 2,5  (acima do limiar)

  Limiar de equipe para microsserviços: 5 devs
  Piso de produtividade (1 dev solo):   0,80

  Ramp-up calibrável (estimativa de meses até velocidade plena):
    Monolito       :  1  (ajuste de 1 a 24 meses)
    Serverless     :  3  (ajuste de 1 a 24 meses)
    Microsserviços :  9  (ajuste de 1 a 24 meses)`}</pre>
          <p style={{ marginTop: '.5rem', fontSize: '11.5px', color: 'var(--muted)' }}>
            Limitação metodológica reconhecida: nenhum desses fatores tem valor universal
            na literatura, e os números acima representam medianas extraídas de evidências
            qualitativas e quantitativas. O analista deve calibrar conforme o contexto do
            projeto. A ferramenta fornece os controles para essa calibração.
          </p>
        </>
      ),
    },
  ]

  return (
    <div className="acc" style={{ marginBottom: '2rem' }}>
      {ITEMS.map((item, i) => (
        <AccordionEntry key={i} {...item} />
      ))}
    </div>
  )
}
