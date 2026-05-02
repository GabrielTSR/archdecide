import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ArchDecide – Seleção de Arquitetura de Software',
  description: 'Modelo multicritério híbrido: custo de infraestrutura baseado em dados reais Azure + custo de engenharia baseado em modelo paramétrico.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
