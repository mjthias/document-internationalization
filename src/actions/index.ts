import 'regenerator-runtime' // eslint-disable-line
import defaultResolve, {PublishAction} from 'part:@sanity/base/document-actions'
import {IResolverProps, Ti18nSchema} from '../types'
import {getSchema, getBaseIdFromId} from '../utils'
import {PublishWithi18nAction} from './PublishWithi18nAction'
import {DeleteWithi18nAction} from './DeleteWithi18nAction'
import {DuplicateWithi18nAction} from './DuplicateWithi18nAction'
import {CopyContentAction} from './CopyContentAction'

export {PublishWithi18nAction, DeleteWithi18nAction, DuplicateWithi18nAction}

export default (props: IResolverProps) => {
  const schema: Ti18nSchema = getSchema(props.type)
  const isI18n = schema && schema.i18n
  const actions = defaultResolve(props).map((Action) => {
    return Action === PublishAction && isI18n ? PublishWithi18nAction : Action
  })
  if (isI18n) {
    actions.push(CopyContentAction)
  }
  if (isI18n && props.id == getBaseIdFromId(props.id)) {
    actions.push(DuplicateWithi18nAction)
    actions.push(DeleteWithi18nAction)
  }
  return actions
}
