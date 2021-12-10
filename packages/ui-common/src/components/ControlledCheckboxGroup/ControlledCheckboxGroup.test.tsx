/**
 * @jest-environment jsdom
 */

import React from 'react'
import { cleanup, render, fireEvent } from '@testing-library/react'
import ControlledCheckboxGroup from './ControlledCheckboxGroup'
import { CheckboxOptionShape } from '../../types'
import '@testing-library/jest-dom/extend-expect'

afterEach(cleanup)

const threeOptions: CheckboxOptionShape[] = [
  {
    id: 'one',
    name: 'One',
    checked: true
  },
  {
    id: 'two',
    name: 'Two',
    checked: false
  },
  {
    id: 'three',
    name: 'Three',
    checked: true
  }
]

test('Should render 3 checkboxes', () => {
  const { queryByLabelText } = render(<ControlledCheckboxGroup options={threeOptions} />)
  // const checks = getAllByLabelText(/^One$|^Two$|^Three$/)
  expect(queryByLabelText(/One/i)).toBeTruthy()
  expect(queryByLabelText(/Two/i)).toBeTruthy()
  expect(queryByLabelText(/Three/i)).toBeTruthy()
})

test('Checkbox click should fire onChange event', () => {
  const onChange = jest.fn()
  const { getByLabelText } = render(<ControlledCheckboxGroup options={threeOptions} onChange={onChange} />)
  fireEvent.click(getByLabelText(/One/i))
  expect(onChange).toBeCalled()
})
