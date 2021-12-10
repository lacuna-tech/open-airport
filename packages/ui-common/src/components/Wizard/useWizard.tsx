import React from 'react'
import { FormikErrors, FormikProvider, useFormik } from 'formik'
import keyBy from 'lodash/keyBy'
import transform from 'lodash/transform'
import { NonEmptyArray } from '@mds-core/mds-types'

import { StepDefinition, WizardRenderFunction, WizardState } from './types'
import { useStepper } from './useStepper'

const WizardContext = React.createContext<WizardState | undefined>(undefined)

// eslint-disable-next-line @typescript-eslint/ban-types
export interface WizardConfig<Values extends object> {
  steps: NonEmptyArray<StepDefinition<Values>>
  initialValues: Values
  children: WizardRenderFunction
  onSubmit?: (values: Values) => void | Promise<void>
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const WizardProvider = <Values extends object>({
  steps,
  initialValues,
  children,
  onSubmit
}: React.PropsWithChildren<WizardConfig<Values>>) => {
  const stepsByName = keyBy(steps, 'name')
  // FIXME: NonEmptyArray.map does not persist the non empty type in the return type, so we have to cast here :(.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stepperState = useStepper({ steps: steps.map(step => step.name) as any })
  const { isLastStep, gotoNextStep } = stepperState
  const currentStep = stepsByName[stepperState.currentStep]
  const currentStepValidate = currentStep.validate
  const formikState = useFormik({
    initialValues,
    validate: React.useCallback(
      values => {
        const errors = {} as FormikErrors<Values>
        currentStepValidate?.(values, errors)
        return errors
      },
      [currentStepValidate]
    ),
    // formik only calls onSubmit when the visible fields have been
    // validated, so we can safely advance to the next step and mark
    // the current step as complete.
    onSubmit: React.useCallback(
      async (values: Values) => {
        if (isLastStep) {
          await onSubmit?.(values)
          return
        }

        gotoNextStep(true)
      },
      [isLastStep, gotoNextStep, onSubmit]
    )
  })
  const { validateForm, setErrors, isValid } = formikState
  const wizardState = React.useMemo(
    (): WizardState => ({
      ...stepperState,
      steps: transform(stepperState.steps, (result, step, stepName) => {
        // eslint-disable-next-line no-param-reassign
        result[stepName] = {
          ...step
        }
      }),
      gotoPreviousStep: () => {
        // Clear existing errors when navigating back
        setErrors({})
        stepperState.gotoPreviousStep()
      },
      gotoNextStep: async () => {
        await validateForm()
        if (!isValid) {
          return
        }
        stepperState.gotoNextStep(true)
      }
    }),
    [isValid, setErrors, stepperState, validateForm]
  )
  return (
    <WizardContext.Provider value={wizardState}>
      <FormikProvider value={formikState}>{children(currentStep.component, wizardState)}</FormikProvider>
    </WizardContext.Provider>
  )
}

export const useWizard = (): WizardState => {
  const state = React.useContext(WizardContext)
  if (state == null) {
    throw new Error('useWizard must be used within a <WizardProvider>!')
  }
  return state
}
