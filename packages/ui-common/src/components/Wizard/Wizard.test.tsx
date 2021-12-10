import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { Field, useFormikContext } from 'formik'

import { Wizard } from './Wizard'
import { WizardRenderFunction, StepState } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const lastCalledWith = <T extends (...args: any[]) => any>(mockFn: jest.MockedFunction<T>): Parameters<T> => {
  const nCalls = mockFn.mock.calls.length
  const lastCall = mockFn.mock.calls[nCalls - 1]
  return lastCall
}

interface FixtureValues {
  field1: string
  field2: string
}

const FormStateReporter = () => {
  const { isValid } = useFormikContext()
  return (
    <section>
      <label>
        isValid <input readOnly value={isValid.toString()} />
      </label>
    </section>
  )
}

const renderFixture = () => {
  const onSubmit: jest.MockedFunction<(values: FixtureValues) => void> = jest.fn()
  const childSpy: jest.MockedFunction<WizardRenderFunction> = jest.fn(
    (currentStep, { gotoPreviousStep, isLastStep }) => (
      <>
        {currentStep}
        <button type='button' onClick={gotoPreviousStep}>
          Back
        </button>
        <button type='submit'>{isLastStep ? 'Submit' : 'Next'}</button>
        <FormStateReporter />
      </>
    )
  )
  render(
    <Wizard<FixtureValues>
      onSubmit={onSubmit}
      initialValues={{
        field1: '',
        field2: ''
      }}
      steps={[
        {
          name: 'Step 1',
          component: (
            <div>
              Step 1{' '}
              <label>
                Field1
                <Field
                  type='text'
                  name='field1'
                  validate={(value: unknown) => {
                    if (!value) {
                      return 'required'
                    }
                  }}
                />
              </label>
            </div>
          )
        },
        {
          name: 'Step 2',
          component: (
            <div>
              Step 2{' '}
              <label>
                Field2
                <Field
                  type='text'
                  name='field2'
                  validate={(value: unknown) => {
                    if (!value) {
                      return 'required'
                    }
                  }}
                />
              </label>
            </div>
          )
        },
        {
          name: 'Step 3',
          component: <div>Step 3</div>
        }
      ]}
    >
      {childSpy}
    </Wizard>
  )
  return { childSpy, onSubmit }
}

it('starts on the first step', () => {
  renderFixture()

  expect(screen.getByText('Step 1')).toBeVisible()
  expect(screen.queryByText('Step 2')).toBe(null)
  expect(screen.queryByText('Step 3')).toBe(null)
})

it('marks first step as visited but incomplete', async () => {
  const { childSpy } = renderFixture()

  const [, { steps }] = lastCalledWith(childSpy)
  expect(steps['Step 1'].state).toEqual<StepState>('incomplete')
})

describe('when validation on a step fails', () => {
  it("doesn't advance to next step when submit button is pressed", async () => {
    renderFixture()

    userEvent.click(screen.getByRole('button', { name: /next/i }))

    // Sanity check
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'isValid' })).toHaveValue('false'))

    expect(screen.getByText('Step 1')).toBeVisible()
    expect(screen.queryByText('Step 2')).toBe(null)
  })

  it('keeps current step marked as incomplete', async () => {
    const { childSpy } = renderFixture()

    userEvent.click(screen.getByRole('button', { name: /next/i }))

    // Wait for validation to finish
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'isValid' })).toHaveValue('false'))

    const [, { steps }] = lastCalledWith(childSpy)
    expect(steps['Step 1'].state).toEqual<StepState>('incomplete')
  })
})

describe('when validation on a step passes', () => {
  it('advances to the next step when a submit button is pressed', async () => {
    renderFixture()

    userEvent.type(screen.getByRole('textbox', { name: /field1/i }), 'test')
    userEvent.click(screen.getByRole('button', { name: /next/i }))

    // Because validation can be asynchronous we have to poll for the screen being visible.
    await waitFor(() => expect(screen.getByText('Step 2')).toBeVisible())
  })

  it('marks current step as completed', async () => {
    const { childSpy } = renderFixture()

    userEvent.type(screen.getByRole('textbox', { name: /field1/i }), 'test')
    userEvent.click(screen.getByRole('button', { name: /next/i }))
    await waitFor(() => expect(screen.getByText('Step 2')).toBeVisible())

    const [, { steps }] = lastCalledWith(childSpy)
    expect(steps['Step 1'].state).toEqual<StepState>('completed')
  })
})

it('clears errors when navigating to previous step', async () => {
  renderFixture()

  userEvent.type(screen.getByRole('textbox', { name: /field1/i }), 'test')
  userEvent.click(screen.getByRole('button', { name: /next/i }))
  await waitFor(() => expect(screen.getByText('Step 2')).toBeVisible())
  userEvent.click(screen.getByRole('button', { name: /back/i }))
  await waitFor(() => expect(screen.getByText('Step 1')).toBeVisible())

  expect(screen.getByRole('textbox', { name: 'isValid' })).toHaveValue('true')
})

it('calls onSubmit w/ final values when submit button pressed on last step w/ no validation errors', async () => {
  const { onSubmit } = renderFixture()

  userEvent.type(screen.getByRole('textbox', { name: /field1/i }), 'test1')
  userEvent.click(screen.getByRole('button', { name: /next/i }))
  await waitFor(() => expect(screen.getByText('Step 2')).toBeVisible())
  userEvent.type(screen.getByRole('textbox', { name: /field2/i }), 'test2')
  userEvent.click(screen.getByRole('button', { name: /next/i }))
  await waitFor(() => expect(screen.getByText('Step 3')).toBeVisible())
  userEvent.click(screen.getByRole('button', { name: /submit/i }))
  await waitFor(() => expect(onSubmit).toHaveBeenCalled())

  expect(onSubmit).toHaveBeenLastCalledWith({ field1: 'test1', field2: 'test2' })
})
