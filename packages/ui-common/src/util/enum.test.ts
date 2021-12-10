import { prettyEnum } from './enum'

describe('prettyEnum', () => {
  it('separates words by underscores ("_")', () => {
    const label = prettyEnum('this_is_an_enum')
    expect(label).toMatch(/this is an enum/i)
  })

  it('capitolizes the first character of each word', () => {
    const label = prettyEnum('this_is_an_enum')
    const words = label.split(' ')
    const firstLetters = words.map(w => w[0])
    expect(firstLetters.every(l => l === l.toUpperCase())).toEqual(true)
  })
})
