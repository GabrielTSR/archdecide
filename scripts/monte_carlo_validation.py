import numpy as np

rng = np.random.default_rng(seed=42)
N = 10_000

ANCHORS_RPS = np.array([2, 80, 1500])
ANCHOR_COST = {
    "monolito":       np.array([108, 1138, 4242]),
    "microsservicos": np.array([489, 1498, 9319]),
    "serverless":     np.array([15, 125, 2011]),
}
DB_FRACTION = {"monolito": 0.0, "microsservicos": 0.12, "serverless": 0.27}
BASELINE_READ_FRAC = 0.70

F_COMP = {"monolito": 1.0, "serverless": 1.3, "microsservicos": 2.0}
F_PROD = {"monolito": 1.0, "serverless": 1.2, "microsservicos": 2.5}
P_MIN, N_MIN, C_JUNIOR = 0.80, 5, 1200

# Limiar de benefício pleno de microsserviços = N_MIN x este multiplicador.
# Uma equipe de exatamente N_MIN pessoas forma só um time stream-aligned
# (Skelton & Pais, 2019); o ganho de paralelismo exige múltiplos times
# independentes, daí o limiar pleno ser um múltiplo de N_MIN, não N_MIN em si.
MICRO_FULL_BENEFIT_MULTIPLIER = 2

# Produtividade de serverless para uma equipe de 1 dev. Decai linearmente até
# F_PROD["serverless"] em N_MIN devs. Eliminar a operação de infraestrutura
# dedicada vale mais quando não há ninguém "sobrando" na equipe para cuidar
# disso (Roberts & Chapin, "Programming AWS Lambda", 2020).
F_PROD_SRV_MAX = 1.5

PORTES = {
    "pequeno": {"rps_median": 2,    "rps_gsd": 1.5, "team_range": (1, 4)},
    "medio":   {"rps_median": 80,   "rps_gsd": 1.4, "team_range": (5, 9)},
    "grande":  {"rps_median": 1500, "rps_gsd": 1.4, "team_range": (10, 20)},
}


def sample_rps(porte_cfg, n):
    """Amostra RPS de uma log-normal ancorada na mediana do porte."""
    mu = np.log(porte_cfg["rps_median"])
    sigma = np.log(porte_cfg["rps_gsd"])
    return rng.lognormal(mean=mu, sigma=sigma, size=n)


def sample_users(rps, n):
    """Deriva usuários simultâneos do RPS, com ruído de ±10%."""
    ratio = rng.uniform(500, 667, size=n)
    noise = rng.uniform(0.9, 1.1, size=n)
    return rps * ratio * noise


def sample_team_size(porte_cfg, n):
    """Amostra o tamanho da equipe (uniforme discreta) por faixa de porte."""
    low, high = porte_cfg["team_range"]
    return rng.integers(low, high + 1, size=n)


def sample_read_fraction(n):
    """Amostra a proporção de leitura (uniforme 60-90%), base SNIA (2010)."""
    return rng.uniform(0.60, 0.90, size=n)


def sample_team_cost(team_sizes):
    """Para cada simulação, sorteia a senioridade de cada dev e soma o custo."""
    probs, levels = [0.25, 0.30, 0.45], np.array([1.0, 2.0, 3.5])
    return np.array([
        np.sum(C_JUNIOR * rng.choice(levels, size=t, p=probs))
        for t in team_sizes
    ])


def infra_cost_base(rps, arch):
    """Interpolação log-linear do custo de infra sobre os 3 pontos-âncora reais."""
    log_x = np.log(ANCHORS_RPS)
    log_rps = np.log(np.clip(rps, ANCHORS_RPS[0], ANCHORS_RPS[-1]))
    return np.interp(log_rps, log_x, ANCHOR_COST[arch])


def read_write_multiplier(read_frac, arch):
    """Ajusta a fração do custo de infra ligada ao banco (RU/s) pela leitura/escrita."""
    ru = lambda rf: rf * 1 + (1 - rf) * 7.5
    ru_ratio = ru(read_frac) / ru(BASELINE_READ_FRAC)
    db = DB_FRACTION[arch]
    return (1 - db) + db * ru_ratio


def productivity_effective(team_size, arch):
    """Fator de produtividade efetivo por arquitetura, ajustado pelo tamanho da
    equipe (form. 4). Monolito não é afetado (ratio fixo = 1,0).

    Microsserviços: abaixo de N_MIN x MICRO_FULL_BENEFIT_MULTIPLIER, interpola
    linearmente de P_MIN (1 dev) até F_PROD (no limiar pleno).

    Serverless: abaixo de N_MIN, decai linearmente de F_PROD_SRV_MAX (1 dev)
    até F_PROD (em N_MIN devs) — direção oposta à de microsserviços.
    """
    if arch == "monolito":
        return F_PROD[arch]

    if arch == "microsservicos":
        full_benefit_team = N_MIN * MICRO_FULL_BENEFIT_MULTIPLIER
        if team_size >= full_benefit_team:
            return F_PROD[arch]
        t = (team_size - 1) / (full_benefit_team - 1)
        return P_MIN + t * (F_PROD[arch] - P_MIN)

    if arch == "serverless":
        if team_size >= N_MIN:
            return F_PROD[arch]
        t = (team_size - 1) / (N_MIN - 1)
        return F_PROD_SRV_MAX - t * (F_PROD_SRV_MAX - F_PROD[arch])

    raise ValueError(f"arquitetura desconhecida: {arch}")


def engineering_cost(c_base, team_sizes, arch):
    """Custo de engenharia: C_base × ratio (form. 2), com produtividade efetiva por arquitetura."""
    f_eff = np.array([productivity_effective(t, arch) for t in team_sizes])
    ratio = F_COMP[arch] / f_eff
    return c_base * ratio, ratio


def total_cost(rps, read_frac, c_base, team_sizes, arch):
    """Custo total projetado: CT = C_infra + C_eng (form. 1)."""
    c_infra = infra_cost_base(rps, arch) * read_write_multiplier(read_frac, arch)
    c_eng, ratio = engineering_cost(c_base, team_sizes, arch)
    return c_infra + c_eng, c_infra, c_eng


def run_porte_simulation(porte_cfg, n):
    """Roda as N simulações Monte Carlo para uma faixa de porte."""
    rps = sample_rps(porte_cfg, n)
    team_sizes = sample_team_size(porte_cfg, n)
    read_frac = sample_read_fraction(n)
    c_base = sample_team_cost(team_sizes)
    return rps, team_sizes, read_frac, c_base


def summarize_architecture(ct_values):
    """Resume uma arquitetura: média e intervalo de confiança de 95%."""
    mean_ct = np.mean(ct_values)
    ci_low, ci_high = np.percentile(ct_values, [2.5, 97.5])
    return mean_ct, ci_low, ci_high


def run_all_portes():
    """Executa a simulação completa para as três faixas de porte."""
    archs = ["monolito", "microsservicos", "serverless"]
    all_results = {}
    for porte, cfg in PORTES.items():
        rps, team, read_frac, c_base = run_porte_simulation(cfg, N)
        cts = {a: total_cost(rps, read_frac, c_base, team, a)[0] for a in archs}
        all_results[porte] = cts
    return all_results


def print_summary(all_results):
    """Imprime a tabela-resumo: % recomendada e CT médio [IC 95%] por porte."""
    archs = ["monolito", "microsservicos", "serverless"]
    for porte, cts in all_results.items():
        stacked = np.vstack([cts[a] for a in archs])
        winner = np.argmin(stacked, axis=0)
        for i, arch in enumerate(archs):
            pct = np.mean(winner == i) * 100
            mean_ct, lo, hi = summarize_architecture(cts[arch])
            print(f"{porte:9} {arch:16} {pct:5.1f}%  USD {mean_ct:8,.0f}  [{lo:,.0f} - {hi:,.0f}]")


if __name__ == "__main__":
    results = run_all_portes()
    print_summary(results)
