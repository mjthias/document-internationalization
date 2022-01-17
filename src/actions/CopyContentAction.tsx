import React from 'react'
import {UiMessages} from '../constants'
import {IResolverProps} from '../types'

export const CopyContentAction = (props: IResolverProps) => {
  const [copyDialogOpen, setCopyDialogOpen] = React.useState(false)

  const onCopy = React.useCallback(() => {
    setCopyDialogOpen(true)
  }, [])

  const onComplete = React.useCallback(() => {}, [])

  return {
    disabled: false,
    label: UiMessages.copyContent.buttonTitle,
    onHandle: onCopy,
    dialog: copyDialogOpen && {
      type: 'modal',
      onClose: onComplete,
      title: UiMessages.copyContent.dialogTitle,
      content: <div>Hello wolrd</div>,
    },
  }
}
