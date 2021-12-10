/**
 * "Copy to clipboard" button.
 */
import React, { useState, useEffect } from 'react'
import copyToClipboard from 'clipboard-copy'
import IconButton from '@material-ui/core/IconButton'
import { Tooltip } from '@material-ui/core'
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome'
import { faPaste } from '@fortawesome/pro-solid-svg-icons'

export interface CopyToClipboardIconProps {
  text: string
  message?: string
  iconProps?: Partial<FontAwesomeIconProps>
}

export default function CopyToClipboardIcon({ text, message, iconProps, ...props }: CopyToClipboardIconProps) {
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)

  const onClick = React.useCallback(async () => {
    await copyToClipboard(text)
    setTooltipOpen(true)
  }, [text, setTooltipOpen])

  useEffect(() => {
    if (tooltipOpen) {
      const timer = setTimeout(() => {
        setTooltipOpen(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [tooltipOpen])

  return (
    <Tooltip
      disableHoverListener={true}
      open={tooltipOpen}
      title={message || 'Copied to clipboard!'}
      placement='top'
      arrow
    >
      <IconButton {...props} onClick={onClick}>
        <FontAwesomeIcon
          {...{
            icon: faPaste,
            size: '1x',
            ...iconProps
          }}
        />
      </IconButton>
    </Tooltip>
  )
}
