import type { ArchKey, BreakdownTab, GrowthKey } from './types'

export const CONFIG = {

  scenarios: {
    small:  { label: 'Pequeno porte', rps:    2, volumeMonth:     500_000, users:     1_000 },
    medium: { label: 'Médio porte',   rps:   80, volumeMonth:  10_000_000, users:    50_000 },
    large:  { label: 'Grande porte',  rps: 1500, volumeMonth: 200_000_000, users: 1_000_000 },
  } as Record<BreakdownTab, { label: string; rps: number; volumeMonth: number; users: number }>,

  costAnchors: {
    monolith:      [{ rps:    2, usd:   108 }, { rps:   80, usd:  1_138 }, { rps: 1500, usd:  4_242 }],
    microservices: [{ rps:    2, usd:   489 }, { rps:   80, usd:  1_498 }, { rps: 1500, usd:  9_319 }],
    serverless:    [{ rps:    2, usd:    15 }, { rps:   80, usd:    125 }, { rps: 1500, usd:  2_011 }],
  } as Record<ArchKey, { rps: number; usd: number }[]>,

  growthRates: {
    none:   { label: 'Estável',    annualRate: 0.00 },
    low:    { label: '+10% a.a.',  annualRate: 0.10 },
    medium: { label: '+30% a.a.',  annualRate: 0.30 },
    high:   { label: '+60% a.a.',  annualRate: 0.60 },
  } as Record<GrowthKey, { label: string; annualRate: number }>,

  architectures: {
    monolith:      { label: 'Monolito',       color: '#185FA5', cssClass: 'wc-mono'  },
    microservices: { label: 'Microsserviços', color: '#C95230', cssClass: 'wc-micro' },
    serverless:    { label: 'Serverless',     color: '#0F6E56', cssClass: 'wc-srv'   },
  } as Record<ArchKey, { label: string; color: string; cssClass: string }>,

  occupancyFactor: 2.9,

  infrastructureBreakdown: {
    small: {
      monolith: {
        totalUsd: 108,
        rows: [
          { section: 'Compute',         name: 'Azure App Service',                    sku: 'Standard S1',              qty: '1 instância',    usd:   69, note: '1 vCore / 1,75 GB RAM. Autoscale até 3 instâncias em picos.' },
          { section: 'Banco de Dados',  name: 'Azure SQL Database',                   sku: 'Standard S1',              qty: '1',              usd:   31, note: '20 DTUs, 250 GB incluídos.' },
          { section: 'Armazenamento',   name: 'Azure Blob Storage',                   sku: 'LRS 20 GB',                qty: '—',              usd:    1, note: 'Arquivos estáticos, backups e uploads.' },
          { section: 'Observabilidade', name: 'Application Insights + Log Analytics', sku: 'Pay-as-you-go',            qty: '~1 GB logs/mês', usd:    8, note: 'Rastreamento de requisições e exceções.' },
        ],
      },
      microservices: {
        totalUsd: 489,
        rows: [
          { section: 'Compute',         name: 'AKS: Worker Node Pool',                sku: '3× Standard_D2s_v3',      qty: '3 nós',          usd: 210, note: '2 vCPUs / 8 GB RAM por nó. HPA habilitado.' },
          { section: 'Compute',         name: 'AKS: System Node Pool',               sku: '2× Standard_D2s_v3',      qty: '2 nós',          usd: 140, note: 'Pool isolado para kube-system, CoreDNS. Custo fixo.' },
          { section: 'Compute',         name: 'Azure Container Registry (ACR)',       sku: 'Basic',                   qty: '1',              usd:   5, note: 'Armazenamento privado de imagens Docker.' },
          { section: 'API Gateway',     name: 'Azure API Management',                 sku: 'Developer',               qty: '1',              usd:  50, note: 'Roteamento, auth e rate limiting. Sem SLA.' },
          { section: 'Banco de Dados',  name: 'Azure Cosmos DB (NoSQL)',              sku: '3 databases',             qty: '3',              usd:  19, note: 'Database-per-Service. Mínimo 100 RU/s por database.' },
          { section: 'Mensageria',      name: 'Azure Service Bus',                    sku: 'Standard Namespace',      qty: '1',              usd:  10, note: 'Comunicação assíncrona (filas e pub/sub).' },
          { section: 'Rede',            name: 'Azure Load Balancer',                  sku: 'Standard',                qty: '1',              usd:  18, note: 'Distribui tráfego via Ingress Controller (NGINX).' },
          { section: 'Armazenamento',   name: 'Azure Blob Storage',                   sku: 'GRS 20 GB',               qty: '—',              usd:   1, note: 'Redundância geográfica para HA.' },
          { section: 'Segurança',       name: 'Azure Key Vault',                      sku: 'Standard',                qty: '1',              usd:  14, note: 'Secrets, certificados e chaves por serviço.' },
          { section: 'Observabilidade', name: 'Azure Monitor + App Insights',         sku: 'Pay-as-you-go',           qty: '~5 GB logs/mês', usd:  20, note: 'Distributed tracing. 1 instância por serviço.' },
        ],
      },
      serverless: {
        totalUsd: 15,
        rows: [
          { section: 'Compute',         name: 'Azure Functions',                      sku: 'Consumption',             qty: '500.000 exec.',  usd:   0, note: 'Primeiros 1M exec./mês gratuitos. Cold start ~500ms.' },
          { section: 'Banco de Dados',  name: 'Azure Cosmos DB',                      sku: 'Serverless',              qty: '3M RU/mês',      usd:   2, note: 'Pay-per-use: 2M RU escritas + 1M RU leituras.' },
          { section: 'API Gateway',     name: 'Azure API Management',                 sku: 'Consumption',             qty: '500k calls',     usd:   2, note: 'Roteamento para as functions. JWT, throttling.' },
          { section: 'Armazenamento',   name: 'Azure Blob Storage',                   sku: 'LRS 20 GB',               qty: '—',              usd:   1, note: 'Storage Queue e state de Durable Functions.' },
          { section: 'Segurança',       name: 'Azure Key Vault',                      sku: 'Standard',                qty: '1',              usd:   5, note: 'Connection strings e secrets das functions.' },
          { section: 'Observabilidade', name: 'Application Insights',                 sku: 'Pay-as-you-go',           qty: '~1 GB logs/mês', usd:   6, note: 'Cold starts visíveis como latência anômala.' },
        ],
      },
    },
    medium: {
      monolith: {
        totalUsd: 1138,
        rows: [
          { section: 'Compute',         name: 'Azure App Service',                    sku: 'Premium P1v3',            qty: '2 instâncias',   usd:  278, note: '2 vCores / 8 GB RAM cada. Autoscale ativo (máx 5).' },
          { section: 'Banco de Dados',  name: 'Azure SQL Database',                   sku: 'General Purpose 4 vCores',qty: '1',              usd:  754, note: '4 vCores, 20,4 GB RAM, read replica. Representa 66% do custo.' },
          { section: 'Cache',           name: 'Azure Cache for Redis',                sku: 'C1 Standard (1 GB)',      qty: '1',              usd:   78, note: 'Reduz carga no BD. Replicado (master+replica).' },
          { section: 'Armazenamento',   name: 'Azure Blob Storage',                   sku: 'LRS 500 GB',              qty: '—',              usd:    9, note: 'Arquivos, backups e uploads.' },
          { section: 'Rede',            name: 'Egress (transferência de dados)',      sku: 'Outbound',                qty: '~143 GB/mês',    usd:   12, note: 'Payload das respostas saindo da Azure.' },
          { section: 'Observabilidade', name: 'Application Insights + Log Analytics', sku: 'Pay-as-you-go',           qty: '~1 GB logs/mês', usd:    8, note: 'Performance e rastreamento.' },
        ],
      },
      microservices: {
        totalUsd: 1498,
        rows: [
          { section: 'Compute',         name: 'AKS: Worker Node Pool',                sku: '6× Standard_D4s_v3',     qty: '6 nós',          usd:  841, note: '4 vCPUs / 16 GB RAM por nó. HPA habilitado.' },
          { section: 'Compute',         name: 'AKS: System Node Pool',               sku: '2× Standard_D2s_v3',     qty: '2 nós',          usd:  140, note: 'Pool isolado para componentes do sistema.' },
          { section: 'Compute',         name: 'Azure Container Registry (ACR)',       sku: 'Standard',               qty: '1',              usd:   20, note: 'Docker com scan de vulnerabilidades.' },
          { section: 'API Gateway',     name: 'Azure API Management',                 sku: 'Basic (SLA 99,9%)',      qty: '1',              usd:  143, note: 'Gateway com SLA. Rate limiting, auth.' },
          { section: 'Banco de Dados',  name: 'Azure Cosmos DB (NoSQL)',              sku: '5 databases',            qty: '5',              usd:  169, note: 'Database-per-Service. 500 RU/s por database.' },
          { section: 'Mensageria',      name: 'Azure Service Bus',                    sku: 'Standard Namespace',     qty: '1',              usd:   10, note: 'Comunicação assíncrona. Filas e tópicos pub/sub.' },
          { section: 'Cache',           name: 'Azure Cache for Redis',                sku: 'C1 Standard (1 GB)',     qty: '1',              usd:   78, note: 'Cache compartilhado entre serviços. Replicado.' },
          { section: 'Rede',            name: 'Azure Load Balancer',                  sku: 'Standard',               qty: '1',              usd:   18, note: 'NGINX Ingress Controller integrado ao AKS.' },
          { section: 'Rede',            name: 'Egress + tráfego inter-serviços',     sku: 'Outbound',               qty: '~186 GB/mês',    usd:   16, note: '143 GB cliente + ~43 GB tráfego interno.' },
          { section: 'Armazenamento',   name: 'Azure Blob Storage',                   sku: 'GRS 500 GB',             qty: '—',              usd:   18, note: 'Redundância geográfica.' },
          { section: 'Segurança',       name: 'Azure Key Vault',                      sku: 'Standard',               qty: '1',              usd:   20, note: 'Secrets e certificados por serviço.' },
          { section: 'Observabilidade', name: 'Azure Monitor + App Insights',         sku: 'Pay-as-you-go',          qty: '~5 GB logs/mês', usd:   24, note: '1 instância App Insights por serviço (5 total).' },
        ],
      },
      serverless: {
        totalUsd: 125,
        rows: [
          { section: 'Compute',         name: 'Azure Functions',                      sku: 'Consumption',            qty: '10M exec.',       usd:   8, note: '9M exec. faturáveis acima do free tier.' },
          { section: 'Banco de Dados',  name: 'Azure Cosmos DB',                      sku: 'Serverless',             qty: '58M RU/mês',      usd:  39, note: '35M RU escritas + 23M RU leituras. 100 GB storage.' },
          { section: 'API Gateway',     name: 'Azure API Management',                 sku: 'Consumption',            qty: '10M calls',       usd:  35, note: 'Roteamento para functions. JWT e throttling.' },
          { section: 'Armazenamento',   name: 'Azure Blob Storage',                   sku: 'LRS 500 GB',             qty: '—',               usd:   9, note: 'Storage Queue e state de Durable Functions.' },
          { section: 'Rede',            name: 'Egress (transferência de dados)',      sku: 'Outbound',               qty: '~143 GB/mês',     usd:  12, note: 'Payload das respostas saindo da Azure.' },
          { section: 'Segurança',       name: 'Azure Key Vault',                      sku: 'Standard',               qty: '1',               usd:   5, note: 'Connection strings e secrets.' },
          { section: 'Observabilidade', name: 'Application Insights',                 sku: 'Pay-as-you-go',          qty: '~5 GB logs/mês',  usd:  17, note: 'Cold starts visíveis como latência anômala.' },
        ],
      },
    },
    large: {
      monolith: {
        totalUsd: 4242,
        rows: [
          { section: 'Compute',         name: 'Azure App Service',                    sku: 'Premium P2v3',           qty: '4 instâncias',   usd: 1110, note: '4 vCores / 16 GB RAM cada. Autoscale ativo (máx 10).' },
          { section: 'Banco de Dados',  name: 'Azure SQL Database',                   sku: 'Business Critical 4 vCores', qty: '1',          usd: 2095, note: 'HA nativa (AlwaysOn), SLA 99,99%, InMemory OLTP.' },
          { section: 'Cache',           name: 'Azure Cache for Redis',                sku: 'C2 Standard (6 GB)',     qty: '1',              usd:  156, note: 'Reduz carga no BD. Essencial nesta escala.' },
          { section: 'Rede',            name: 'Azure CDN',                            sku: 'Standard',               qty: '~3.815 GB',      usd:  309, note: 'Distribuição de conteúdo estático.' },
          { section: 'Rede',            name: 'Egress (transferência de dados)',      sku: 'Outbound',               qty: '~3.815 GB/mês',  usd:  332, note: 'Payload das respostas (após CDN).' },
          { section: 'Armazenamento',   name: 'Azure Blob Storage',                   sku: 'LRS 10.000 GB',          qty: '—',              usd:  180, note: 'Arquivos, backups e uploads.' },
          { section: 'Observabilidade', name: 'Application Insights + Log Analytics', sku: 'Pay-as-you-go',          qty: '~20 GB logs/mês',usd:   60, note: 'Performance e rastreamento.' },
        ],
      },
      microservices: {
        totalUsd: 9319,
        rows: [
          { section: 'Compute',         name: 'AKS: Worker Node Pool',                sku: '20× Standard_D8s_v3',   qty: '20 nós',         usd: 5606, note: '8 vCPUs / 32 GB RAM por nó. HPA habilitado.' },
          { section: 'Compute',         name: 'AKS: System Node Pool',               sku: '2× Standard_D2s_v3',    qty: '2 nós',          usd:  140, note: 'Pool isolado para componentes do sistema.' },
          { section: 'Compute',         name: 'Azure Container Registry (ACR)',       sku: 'Standard',              qty: '1',              usd:   20, note: 'Armazenamento de imagens Docker.' },
          { section: 'API Gateway',     name: 'Azure API Management',                 sku: 'Basic (SLA 99,9%)',     qty: '1',              usd:  143, note: 'Gateway com SLA. Rate limiting e autenticação.' },
          { section: 'Banco de Dados',  name: 'Azure Cosmos DB (NoSQL)',              sku: '8 databases',           qty: '8',              usd: 1422, note: 'Database-per-Service. 2.000 RU/s por database.' },
          { section: 'Mensageria',      name: 'Azure Service Bus',                    sku: 'Premium (1 MU)',        qty: '1',              usd:  681, note: 'Garantia de entrega e VNet integration.' },
          { section: 'Cache',           name: 'Azure Cache for Redis',                sku: 'C2 Standard (6 GB)',    qty: '1',              usd:  156, note: 'Cache compartilhado entre serviços.' },
          { section: 'Rede',            name: 'Azure Load Balancer',                  sku: 'Standard (2 inst.)',    qty: '2',              usd:   37, note: 'Distribui tráfego entre pods.' },
          { section: 'Rede',            name: 'Egress + tráfego inter-serviços',     sku: 'Outbound',              qty: '~4.960 GB/mês',  usd:  432, note: '3.815 GB cliente + ~1.145 GB interno.' },
          { section: 'Armazenamento',   name: 'Azure Blob Storage',                   sku: 'GRS 10.000 GB',         qty: '—',              usd:  360, note: 'Redundância geográfica.' },
          { section: 'Segurança',       name: 'Azure Key Vault',                      sku: 'Standard',              qty: '1',              usd:   29, note: 'Secrets e certificados (8 serviços).' },
          { section: 'Observabilidade', name: 'Azure Monitor + App Insights',         sku: 'Pay-as-you-go',         qty: '~100 GB logs/mês',usd: 292, note: '1 instância App Insights por serviço (8 total).' },
        ],
      },
      serverless: {
        totalUsd: 2011,
        rows: [
          { section: 'Compute',         name: 'Azure Functions',                      sku: 'Premium EP2',           qty: '3 inst. mín.',   usd:  513, note: 'Plano Premium elimina cold start. 200M exec./mês.' },
          { section: 'Banco de Dados',  name: 'Azure Cosmos DB',                      sku: 'Provisionado 10k RU/s', qty: '1',              usd:  558, note: 'Migração para provisionado — mais econômico em 200M req/mês (RP, p.12).' },
          { section: 'API Gateway',     name: 'Azure API Management',                 sku: 'Basic (SLA 99,9%)',     qty: '1',              usd:  143, note: 'Roteamento para functions com SLA.' },
          { section: 'Armazenamento',   name: 'Azure Blob Storage',                   sku: 'LRS 10.000 GB',         qty: '—',              usd:  180, note: 'Storage Queue e state de Durable Functions.' },
          { section: 'Rede',            name: 'Egress (transferência de dados)',      sku: 'Outbound',              qty: '~3.815 GB/mês',  usd:  332, note: 'Payload das respostas saindo da Azure.' },
          { section: 'Segurança',       name: 'Azure Key Vault',                      sku: 'Standard',              qty: '1',              usd:    5, note: 'Connection strings e secrets das functions.' },
          { section: 'Observabilidade', name: 'Application Insights',                 sku: 'Pay-as-you-go',         qty: '~100 GB logs/mês',usd: 279, note: 'Rastreamento de execuções.' },
        ],
      },
    },
  },
}

export const ARCH_KEYS: (keyof typeof CONFIG.architectures)[] = ['monolith', 'microservices', 'serverless']
