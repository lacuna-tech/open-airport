import React, { useState } from 'react'
import { Button } from '@material-ui/core'
import { ProgressBar } from './ProgressBar'

export default {
  title: 'ProgressBar',
  component: ProgressBar,
  argTypes: {
    steps: { defaultValue: ['Step 1', 'Step 2', 'Step 3'], name: 'steps', control: { type: 'array' } },
    currentStep: { defaultValue: 0, name: 'currentStep', control: { type: 'number' } },
    showCompleted: { defaultValue: false, name: 'showCompleted', control: { type: 'boolean' } }
  }
}

type BasicProps = {
  currentStep: number
  steps: string[]
  showCompleted?: boolean
}

export const Default = ({ currentStep, steps, showCompleted }: BasicProps) => {
  return (
    <div style={{ width: '50vw' }}>
      <ProgressBar {...{ currentStep, steps, showCompleted }} />
    </div>
  )
}

const policySteps = ['Policy Details', 'Policy Rules', 'Review']
export const CreatePolicyProgressBar = ({ showCompleted }: { showCompleted?: boolean }) => {
  const [currentStep, setCurrentStep] = useState<number>(0)

  return (
    <div style={{ width: '50vw' }}>
      <ProgressBar {...{ currentStep, showCompleted, steps: policySteps }} />
      <Button
        disabled={currentStep === 0}
        onClick={() => {
          if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
          }
        }}
      >
        Prev
      </Button>
      <Button
        disabled={currentStep >= 2}
        onClick={() => {
          if (currentStep < 2) {
            setCurrentStep(currentStep + 1)
          }
        }}
      >
        Next
      </Button>
    </div>
  )
}
