import { CommonConfig } from '@lacuna/agency-config'

const {
  agency: { locale, currency }
} = CommonConfig

export const currencyFormater = new Intl.NumberFormat(locale, { style: 'currency', currency })
export const numberFormater = new Intl.NumberFormat(locale)
export const integerFormater = new Intl.NumberFormat(locale, {
  maximumFractionDigits: 0
})

export const percentFormater = new Intl.NumberFormat(locale, {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})
