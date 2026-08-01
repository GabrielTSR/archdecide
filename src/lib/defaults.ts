/**
 * Parâmetros editáveis do modelo paramétrico.
 *
 * Separados do config.ts (dados estáticos de infraestrutura) para facilitar
 * calibração independente sem tocar nos dados Azure.
 *
 * Fundamentação dos valores:
 *   seniorityFactor  — diferencial salarial de mercado (BRL/USD, 2025–2026)
 *   complexityFactor — esforço relativo por arquitetura (COCOMO II effort multipliers,
 *                      Taibi et al. 2019, Villamizar et al. 2017)
 *   productivityFactor — ganho de paralelismo de equipe (Lei de Conway 1968,
 *                        Lei de Brooks 1975, casos Netflix/Amazon/Spotify)
 */

// ── Equipe ────────────────────────────────────────────────────────────────────

// Mercado brasileiro 2025: salário CLT R$4.000-4.500 + encargos ~60%
// (INSS patronal 20%, FGTS 8%, 13o, férias, RAT) = R$6.400-7.200/mês
// Câmbio médio 2025: USD/BRL ~5,60  =>  aproximadamente $1.200/mês
export const DEFAULT_COST_PER_DEV_JUNIOR = 1_200 // USD/mês — custo total ao empregador (mercado BR)

export const DEFAULT_TEAM_COMPOSITION = {
  junior: 1,
  pleno:  2,
  senior: 0,
}

// ── Fator de Senioridade ──────────────────────────────────────────────────────
// Júnior = 1,0 (linha de base absoluta). Referência: ~R$4.000 CLT, total ~R$6.700/mês.
// Pleno: 2,0x — salário ~R$8.400 CLT, custo total ~R$13.440 (~$2.400 USD). O mercado
//   brasileiro tem gap maior do que mercados anglófonos devido à alta demanda por plenos
//   qualificados com experiência em arquitetura e cloud.
// Sênior: 3,5x — salário ~R$14.700 CLT, custo total ~R$23.520 (~$4.200 USD).
//   Seniores especializados (cloud-native, DBA, SRE) ficam nesse patamar em SP/RJ 2025.
//   Muitos migram para PJ/internacional, elevando o custo de retenção CLT.

export const DEFAULT_SENIORITY_FACTOR = {
  junior: 1.0,
  pleno:  2.0,
  senior: 3.5,
}

// ── Fator de Complexidade Arquitetural ────────────────────────────────────────
// Monolito = 1,0 (linha de base). Multiplica o custo de engenharia.
//
// Serverless 1,3×: FaaS é maduro em 2026, mas debugging distribuído,
//   testes locais e gerenciamento de estado ainda adicionam overhead.
//
// Microsserviços 2,0×: reduzido de 2,2 — Docker, Kubernetes, Dapr e
//   plataformas de service mesh reduziram custo operacional significativamente
//   desde os estudos de Villamizar et al. (2017) e Taibi et al. (2019).

export const DEFAULT_COMPLEXITY_FACTOR = {
  monolith:      1.0,
  serverless:    1.3,
  microservices: 2.0,
}

// ── Fator de Produtividade Arquitetural ───────────────────────────────────────
// Monolito = 1,0 (linha de base). Divide o custo de engenharia.
// Inverso (1/ratio) representa também a velocidade de entrega por dev.
//
// Serverless 1,2×: infra gerenciada elimina ops, auto-scaling nativo,
//   ciclos de deploy curtos. Penalizado por debugging distribuído, cold start
//   e limites de plano (Roberts & Chapin, "Programming AWS Lambda", 2020).
//
// Microsserviços 2,5×: ganho de paralelismo com times stream-aligned
//   (Skelton & Pais, "Team Topologies", 2019). Empiricamente, organizações
//   classificadas como "Elite" pelo DORA ("Accelerate", Forsgren/Humble/Kim
//   2018) entregam de 2× a 4× mais frequência de deploy quando combinam
//   microsserviços com práticas DevOps maduras. Convertido em throughput de
//   features por dev, isso corresponde a ~20–40% acima do monolito em equipes
//   acima do limiar — daí o ratio efetivo 2,0/2,5 = 0,80 (25% mais output por
//   dev). Abaixo do limiar, este ganho some (Lei de Conway: sem times
//   independentes, microsserviços vira overhead puro).

export const DEFAULT_PRODUCTIVITY_FACTOR = {
  monolith:      1.0,
  serverless:    1.2,
  microservices: 2.5,
}

// ── Limiar de equipe para microsserviços (Lei de Conway) ─────────────────────
// Abaixo deste número de devs, o fator de produtividade de microsserviços
// é reduzido linearmente até MICRO_SMALL_TEAM_PENALTY (overhead supera o
// benefício de paralelismo).
// Fundamentação:
//   Conway, M. (1968) "How Do Committees Invent?": sistemas espelham a
//     estrutura de comunicação. Sem times independentes, microsserviços
//     replica fronteiras inexistentes.
//   Skelton & Pais (2019) "Team Topologies": stream-aligned teams precisam
//     de 5 a 9 pessoas por fluxo de valor. Abaixo disso, a carga cognitiva
//     de operar múltiplos serviços supera a capacidade do time.
//   Fritzsch et al. (2019) "Microservices Migration in Industry": casos
//     industriais mostram que migrações com equipes < 5 devs raramente
//     atingem os benefícios prometidos.

export const DEFAULT_MICRO_MIN_TEAM = 5
// Piso de produtividade ao isolar 1 dev gerenciando múltiplos serviços
// (cognitive load extrema, sem ganho de paralelismo possível).
export const MICRO_SMALL_TEAM_PENALTY = 0.8

// ── Limiar de benefício pleno de microsserviços ───────────────────────────────
// O fator de produtividade configurado só é aplicado integralmente quando a
// equipe atinge microMinTeam × este multiplicador (padrão: 2× → 10 devs).
// Fundamentação: uma equipe de exatamente microMinTeam pessoas forma apenas
// UM time stream-aligned (Skelton & Pais, 2019). O ganho de paralelismo de
// microsserviços — a razão de ser da arquitetura — só aparece quando existem
// MÚLTIPLOS times independentes trabalhando em paralelo, o que exige um
// múltiplo do limiar mínimo, não o limiar em si.
export const DEFAULT_MICRO_FULL_BENEFIT_MULTIPLIER = 2

// ── Produtividade máxima de serverless em equipe muito pequena ───────────────
// Abaixo de microMinTeam, o fator de produtividade de serverless decai
// linearmente deste valor (1 dev) até o valor configurado (microMinTeam devs),
// na direção oposta ao ajuste de microsserviços.
// Fundamentação: a proposta de valor central do serverless é eliminar a
// necessidade de operação/infraestrutura dedicada (sem servidores para
// gerenciar, sem capacity planning, scaling automático). Esse benefício vale
// proporcionalmente mais quando a equipe é tão pequena que não há ninguém
// "sobrando" para cuidar de operação — cada hora não gasta em infra é uma
// hora a mais de output por dev (Roberts & Chapin, "Programming AWS Lambda",
// 2020).
export const DEFAULT_SRV_PROD_MAX_SMALL_TEAM = 1.5

// ── Estado inicial da UI ──────────────────────────────────────────────────────

export const DEFAULT_GROWTH_KEY = 'none' as const
export const DEFAULT_RPS_SLIDER = 13 // → ~3 req/s via sliderToRps

// ── Horizonte de projeção (meses) ─────────────────────────────────────────────
// Ajustável de 12 a 120 meses (1 a 10 anos). 36 é o horizonte clássico de TCO,
// mas microsserviços costuma compensar apenas em horizontes maiores.
export const DEFAULT_PROJECTION_MONTHS = 36

// ── Curva de aprendizado (ramp-up de produtividade, em meses) ─────────────────
// Tempo até a equipe atingir velocidade plena (regime permanente) em cada
// arquitetura. Modela o "custo de partida" arquitetural.
//
//   Monolito 1 mês: sem setup distribuído. Codebase única, deploy único.
//     Onboarding clássico de software (Brooks, "Mythical Man-Month" 1975).
//
//   Serverless 3 meses: curva de aprendizado de cold start, limites de plano,
//     orquestração de funções (Durable Functions / Step Functions), debug
//     distribuído. Roberts & Chapin (2020) reportam estabilização típica em
//     2–4 meses para equipes novas no paradigma.
//
//   Microsserviços 9 meses: setup completo de service mesh, observabilidade
//     distribuída (tracing, métricas, logs centralizados), CI/CD por serviço,
//     definição de contratos de API entre times, cultura DevOps.
//     Empiricamente, Fritzsch et al. (2019) e Soldani et al. (2018, "Pains
//     and Gains of Microservices") documentam migrações que levam de 6 a 18
//     meses para atingir produtividade plena. 9 meses é a mediana reportada.
export const VELOCITY_RAMP_MONTHS = {
  monolith:      1,
  serverless:    3,
  microservices: 9,
}
