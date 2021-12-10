import React from 'react'
import produce from 'immer'
import { NonEmptyArray } from '@mds-core/mds-types'

import { first } from '../../util/enumerable'

import { Step, StepperState, StepState } from './types'

interface InternalState {
  currentStep: string
  stepStates: Record<string, StepState>
  steps: string[]
}

type Action = { type: 'gotoNextStep'; payload: { completed: boolean } } | { type: 'gotoPreviousStep' }

/* eslint-disable no-param-reassign */
const reducer: React.Reducer<InternalState, Action> = produce((draft, action) => {
  const gotoStep = (nextStep: string) => {
    const { stepStates } = draft
    draft.currentStep = nextStep
    const nextStepState = stepStates[nextStep]
    if (nextStepState === 'unvisited') {
      stepStates[nextStep] = 'incomplete'
    }
  }
  switch (action.type) {
    case 'gotoNextStep': {
      const { currentStep, steps, stepStates } = draft
      if (action.payload.completed) {
        stepStates[currentStep] = 'completed'
      }
      const currentStepIndex = steps.indexOf(currentStep)
      const nextStep = steps[currentStepIndex + 1]
      if (nextStep) {
        gotoStep(nextStep)
      }
      break
    }
    case 'gotoPreviousStep': {
      const { currentStep, steps } = draft
      const currentStepIndex = steps.indexOf(currentStep)
      const prevStep = steps[currentStepIndex - 1]
      if (prevStep) {
        gotoStep(prevStep)
      }
      break
    }
    default:
  }
})
/* eslint-enable no-param-reassign */

export interface StepperConfig {
  steps: NonEmptyArray<string>
}

export const useStepper = ({ steps }: StepperConfig): Readonly<StepperState> => {
  const firstStep = first(steps)
  const [internalState, dispatch] = React.useReducer(reducer, {
    currentStep: firstStep,
    stepStates: steps.reduce((acc, step) => {
      acc[step] = firstStep === step ? 'incomplete' : 'unvisited'
      return acc
    }, {} as Record<string, StepState>),
    steps
  })
  const nSteps = steps.length
  const currentStepN = steps.indexOf(internalState.currentStep)
  return {
    nSteps,
    steps: steps.reduce((acc, step) => {
      acc[step] = { name: step, state: internalState.stepStates[step] }
      return acc
    }, {} as Record<string, Step>),
    currentStep: internalState.currentStep,
    isFirstStep: currentStepN <= 0,
    isLastStep: currentStepN >= nSteps - 1,
    gotoNextStep: (completed = false) => dispatch({ type: 'gotoNextStep', payload: { completed } }),
    gotoPreviousStep: () => dispatch({ type: 'gotoPreviousStep' })
  }
}
