import React from 'react'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepIcon from '@material-ui/core/StepIcon'
import StepConnector from '@material-ui/core/StepConnector'
import { withStyles } from '@material-ui/core/styles'

import { useWizard } from './useWizard'

const WizardStepperStepConnector = withStyles(
  theme => ({
    root: {
      color: theme.palette.text.secondary,

      '&$active': {
        color: theme.palette.primary.main
      }
    },
    line: {
      borderColor: 'currentColor'
    },
    active: {}
  }),
  { name: 'WizardStepperStepIcon' }
)(StepConnector)

const WizardStepperStepIcon = withStyles(
  theme => ({
    root: {
      '&$active': {
        color: theme.palette.primary.main
      },
      '&$completed': {
        color: theme.palette.text.secondary
      }
    },
    active: {},
    completed: {}
  }),
  { name: 'WizardStepperStepIcon' }
)(StepIcon)

const WizardStepperStepLabel = withStyles(
  theme => ({
    root: {
      color: theme.palette.text.secondary
    },
    label: {
      '&$active': {
        fontWeight: theme.typography.fontWeightBold,
        color: theme.palette.text.primary
      },
      '&$completed': {
        color: 'inherit'
      }
    },
    active: {},
    completed: {}
  }),
  { name: 'WizardStepperStepLabel' }
)(StepLabel)

export const WizardStepper: React.FunctionComponent = React.memo(() => {
  const { steps, currentStep } = useWizard()
  return (
    <Stepper connector={<WizardStepperStepConnector />}>
      {Object.values(steps).map(step => (
        <Step
          key={step.name}
          active={currentStep === step.name}
          completed={step.state === 'completed' && currentStep !== step.name}
        >
          <WizardStepperStepLabel StepIconComponent={WizardStepperStepIcon}>{step.name}</WizardStepperStepLabel>
        </Step>
      ))}
    </Stepper>
  )
})
