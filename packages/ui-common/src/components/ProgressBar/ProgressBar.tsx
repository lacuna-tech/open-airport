import React from 'react'
import { Stepper, Step, StepLabel } from '@material-ui/core'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    active: {
      color: `${theme.palette.custom.link} !important`
    }
  })
)

export const ProgressBar = ({
  currentStep,
  steps,
  showCompleted
}: {
  currentStep: number
  steps: string[]
  showCompleted?: boolean
}) => {
  const classes = useStyles()
  const stepProps = showCompleted ? undefined : { completed: false }
  return (
    <Stepper activeStep={currentStep}>
      {steps.map((label, index) => {
        return (
          <Step {...stepProps} key={`step_${label}_${index}`}>
            <StepLabel
              {...{
                StepIconProps: {
                  classes: {
                    active: classes.active
                  }
                }
              }}
            >
              {label}
            </StepLabel>
          </Step>
        )
      })}
    </Stepper>
  )
}
