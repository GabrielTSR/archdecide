# ArchDecide: Architecture Decision Support System

An interactive tool built as part of an MBA thesis at USP ESALQ (Software Engineering). It models the total cost of ownership (TCO) for three architectural styles — **Monolith**, **Serverless**, and **Microservices** — combining real cloud infrastructure pricing with a parametric engineering cost model.

## How it works

Total monthly cost per architecture:

```
Total Cost = Infrastructure (log-linear interpolation over Azure price anchors)
           + Engineering (parametric model: team × complexity/productivity factors)
```

The tool recommends the lowest-cost architecture and projects TCO and delivery velocity over up to 10 years.

## Features

- **Configurable inputs**: RPS (load), team composition (junior/mid/senior), cost per level, growth scenario
- **Calibratable parametric model**: architectural complexity factors, productivity factors, minimum team threshold for microservices (Conway's Law), and ramp-up time per architecture
- **Cost projection**: 12 to 120-month horizon with stable, low, medium, or high growth
- **Velocity chart**: ramp-up curves per architecture with steady-state output
- **Infrastructure breakdown**: per-service Azure cost detail for each scenario size
- **Methodology panel**: formulas, reference scenarios with apply buttons, and academic sources

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- TypeScript
- Chart.js / react-chartjs-2
- Custom CSS (no UI framework)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Academic references

Conway (1968) · Brooks (1975) · Boehm et al. (2000) · Forsgren, Humble & Kim (2018) · Skelton & Pais (2019) · Soldani et al. (2018) · Fritzsch et al. (2019) · Newman (2021)
