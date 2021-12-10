import { uniqueBy } from './enumerable'

describe('Enumerable Tests', () => {
  describe('Testing uniqueBy', () => {
    test('Filters properly', () => {
      const source = [
        { name: 'a', id: 1, value: 'not-expected' },
        { name: 'c', id: 3, value: 'not-expected' },
        { name: 'b', id: 2, value: 'expected' },
        { name: 'c', id: 3, value: 'expected' },
        { name: 'a', id: 1, value: 'expected' }
      ]

      // Note: Preserving the original order, but favoring instances of latter duplicates
      const expected = [
        { name: 'a', id: 1, value: 'expected' },
        { name: 'c', id: 3, value: 'expected' },
        { name: 'b', id: 2, value: 'expected' }
      ]

      const actual = uniqueBy(source, value => value.id)

      expect(JSON.stringify(actual)).toEqual(JSON.stringify(expected))
    })
  })
})
