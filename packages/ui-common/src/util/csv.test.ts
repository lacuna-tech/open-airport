import { stringifyCsv } from './csv'

describe('stringifyCsv', () => {
  it('throws an error when no headers are passed', () => {
    expect(() => stringifyCsv([], [])).toThrowError(/no headers/i)
  })

  it('includes headers in output', async () => {
    const csv = stringifyCsv(['col 1', 'col 2', 'col 3'], [])
    expect(csv).toEqual(new Blob(['"col 1","col 2","col 3"']))
  })

  it('returns blob w/ correct content type', () => {
    const csv = stringifyCsv(['col 1', 'col 2', 'col 3'], [])
    expect(csv.type).toEqual('text/csv')
  })

  it('properly escapes quotes', () => {
    const csv = stringifyCsv(
      // Quotes in headers
      ['col "1"', 'col 2', '"col" 3'],
      [
        {
          'col "1"': 'row 1 col 1',
          // Quotes in entry
          'col 2': 'r"ow" 1 col 2',
          '"col" 3': 'row 1 col 3'
        },
        {
          'col "1"': 'row 2 col 1',
          'col 2': 'row 2 col 2',
          '"col" 3': 'row 2 col 3'
        }
      ]
    )
    expect(csv).toEqual(
      new Blob([
        `\
"col ""1""","col 2","""col"" 3"
"row 1 col 1","r""ow"" 1 col 2","row 1 col 3"
"row 2 col 1","row 2 col 2","row 2 col 3"\
`
      ])
    )
  })

  it('properly escapes newlines', () => {
    const csv = stringifyCsv(
      // Newlines in headers
      ['col 1', 'col 2', 'col\n 3'],
      [
        {
          'col 1': 'row 1 col 1',
          'col 2': 'row 1 col 2',
          'col\n 3': 'row 1 col 3'
        },
        {
          // newline in entry
          'col 1': 'row 2 col 1\n',
          'col 2': 'row 2 col 2',
          'col\n 3': 'row 2 col 3'
        }
      ]
    )
    expect(csv).toEqual(
      new Blob([
        `\
"col 1","col 2","col\\n 3"
"row 1 col 1","row 1 col 2","row 1 col 3"
"row 2 col 1\\n","row 2 col 2","row 2 col 3"\
`
      ])
    )
  })
})
