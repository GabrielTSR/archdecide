'use client'

import { useState, useCallback, useMemo } from 'react'
import { runDomain, sliderToRps } from '@/lib/domain'
import { buildDefaultState, buildDefaultModelParams, DEFAULT_RPS_SLIDER } from '@/lib/defaults'
import type { AppState } from '@/lib/types'

/**
 * Estado da aplicação e seu resultado derivado (runDomain), isolados da
 * composição de layout em page.tsx.
 */
export function useAppState() {
  const [state, setState] = useState<AppState>(() => buildDefaultState(sliderToRps(DEFAULT_RPS_SLIDER)))

  const result = useMemo(() => runDomain(state), [state])

  const update = useCallback((patch: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...patch }))
  }, [])

  const resetModelParams = useCallback(() => {
    setState(prev => ({ ...prev, ...buildDefaultModelParams() }))
  }, [])

  return { state, result, update, resetModelParams }
}
