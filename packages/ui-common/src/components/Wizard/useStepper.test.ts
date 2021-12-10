import { act, renderHook } from '@testing-library/react-hooks'

import { StepState } from './types'
import { useStepper } from './useStepper'

it('starts on first step', () => {
  const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

  const { currentStep } = result.current
  expect(currentStep).toEqual<string>('1')
})

it('initially marks first step as incomplete', () => {
  const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

  const { currentStep, steps } = result.current
  expect(steps[currentStep].state).toEqual<StepState>('incomplete')
})

it('initially marks other steps as unvisited', () => {
  const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

  const { steps } = result.current
  expect(steps['2'].state).toEqual<StepState>('unvisited')
  expect(steps['3'].state).toEqual<StepState>('unvisited')
})

describe('gotoNextStep()', () => {
  it('advances to the next step', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep()
    })

    const { currentStep } = result.current
    expect(currentStep).toEqual<string>('2')
  })

  it('marks the next step as incomplete', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep()
    })

    const { currentStep, steps } = result.current
    expect(steps[currentStep].state).toEqual<StepState>('incomplete')
  })

  it('leaves the current step as incomplete by default', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep()
    })

    const { steps } = result.current
    expect(steps['1'].state).toEqual<StepState>('incomplete')
  })

  it('marks the current step as completed when directed to', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep(true)
    })

    const { steps } = result.current
    expect(steps['1'].state).toEqual<StepState>('completed')
  })

  it('does NOT advance past the last step', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep(true)
    })
    act(() => {
      result.current.gotoNextStep(true)
    })
    act(() => {
      result.current.gotoNextStep(true)
    })

    const { currentStep } = result.current
    expect(currentStep).toEqual<string>('3')
  })

  it('does mark the last step completed when directed', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep(true)
    })
    act(() => {
      result.current.gotoNextStep(true)
    })
    act(() => {
      result.current.gotoNextStep(true)
    })

    const { steps } = result.current
    expect(steps['3'].state).toEqual<StepState>('completed')
  })
})

describe('gotoPreviousStep()', () => {
  it('does NOT advance past first step', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoPreviousStep()
    })

    const { currentStep } = result.current
    expect(currentStep).toEqual<string>('1')
  })

  it('advances to the previous step', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep()
    })
    act(() => {
      result.current.gotoPreviousStep()
    })

    const { currentStep } = result.current
    expect(currentStep).toEqual<string>('1')
  })
})

describe('nSteps', () => {
  it('is set to the number of steps', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    const { nSteps } = result.current
    expect(nSteps).toEqual(3)
  })
})

describe('isFirstStep', () => {
  it('is set to true on the first step', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    const { isFirstStep } = result.current
    expect(isFirstStep).toEqual(true)
  })

  it('is set to false on all other steps', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep()
    })

    const { isFirstStep } = result.current
    expect(isFirstStep).toEqual(false)
  })
})

describe('isLastStep', () => {
  it('is set to true on the last step', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep()
    })
    act(() => {
      result.current.gotoNextStep()
    })

    const { isLastStep } = result.current
    expect(isLastStep).toEqual(true)
  })

  it('is set to false on all other steps', () => {
    const { result } = renderHook(() => useStepper({ steps: ['1', '2', '3'] }))

    act(() => {
      result.current.gotoNextStep()
    })

    const { isLastStep } = result.current
    expect(isLastStep).toEqual(false)
  })
})
