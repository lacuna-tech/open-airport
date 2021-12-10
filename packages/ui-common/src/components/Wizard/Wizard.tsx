import { Form } from 'formik'
import React from 'react'

import { WizardProvider, WizardConfig } from './useWizard'

// eslint-disable-next-line @typescript-eslint/ban-types
export interface WizardProps<Values extends object> extends WizardConfig<Values> {
  className?: string
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const Wizard = <Values extends object>({
  steps,
  initialValues,
  children,
  onSubmit,
  className
}: React.PropsWithChildren<WizardProps<Values>>) => {
  return (
    <WizardProvider steps={steps} initialValues={initialValues} onSubmit={onSubmit}>
      {(currentStep, wizardState) => <Form className={className}>{children(currentStep, wizardState)}</Form>}
    </WizardProvider>
  )
}
