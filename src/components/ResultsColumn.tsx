import type { DomainResult, AppState } from '@/lib/types'
import WinnerCard from './WinnerCard'
import ArchCards from './ArchCards'
import RatioTable from './RatioTable'

interface Props {
  result: DomainResult
  state: AppState
}

export default function ResultsColumn({ result, state }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      <WinnerCard result={result} />
      <ArchCards result={result} />
      <RatioTable result={result} state={state} />
    </div>
  )
}
