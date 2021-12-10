import React from 'react'
import { Nullable } from '@mds-core/mds-types'
import { Box, IconButton } from '@material-ui/core'
import { KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons'

export const CustomPagination = ({
  cursor,
  onBackBtnClicked,
  onNextBtnClicked
}: {
  cursor: { prev: Nullable<string>; next: Nullable<string> }
  onBackBtnClicked: () => void
  onNextBtnClicked: () => void
}) => {
  return (
    <Box>
      <IconButton {...{ disabled: !cursor || cursor.prev === null, onClick: onBackBtnClicked }}>
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton {...{ disabled: !cursor || cursor.next === null, onClick: onNextBtnClicked }}>
        <KeyboardArrowRight />
      </IconButton>
    </Box>
  )
}
