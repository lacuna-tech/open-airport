import { FormikErrors } from 'formik'

// eslint-disable-next-line @typescript-eslint/ban-types
export interface StepDefinition<Values extends object> {
  name: string
  component: React.ReactElement
  validate?: ValidationFunction<Values>
}

export type StepState = 'unvisited' | 'incomplete' | 'completed'

export interface Step {
  name: string
  state: StepState
}

export interface StepperState {
  nSteps: number
  steps: Record<string, Step>
  currentStep: string
  isFirstStep: boolean
  isLastStep: boolean
  gotoNextStep: (completed?: boolean) => void
  gotoPreviousStep: () => void
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface WizardState extends Omit<StepperState, 'gotoNextStep'> {
  gotoNextStep: () => void
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ValidationFunction<Values extends object> {
  (values: Readonly<Values>, errors: FormikErrors<Values>): void
}

// eslint-disable-next-line @typescript-eslint/ban-types
export interface WizardRenderFunction {
  (currentStep: React.ReactElement, wizardState: WizardState): React.ReactElement
}
