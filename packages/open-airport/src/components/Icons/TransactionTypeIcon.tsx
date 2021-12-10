import React from 'react'
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import { TRANSACTION_TYPE, transactionTypeMap } from 'lib/trip'

export function TransactionTypeIcon({
  transaction_type,
  ...props
}: Omit<FontAwesomeIconProps, 'icon' | 'color'> & {
  transaction_type: TRANSACTION_TYPE
}) {
  const { icon } = transactionTypeMap[transaction_type]
  return <FontAwesomeIcon {...{ ...props, icon }} />
}
