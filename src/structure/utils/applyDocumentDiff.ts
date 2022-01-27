import {PatchOperations, SanityDocument} from '@sanity/client'
import compact from 'just-compact'
import {DocumentDiff} from '../../types'
import {getSanityClient} from '../../utils'

export function applyDocumentDiffs<R>(diffs: DocumentDiff[]): Promise<SanityDocument<R>> {
  const sanityClient = getSanityClient()
  const transaction = sanityClient.transaction()
  diffs.forEach((diff) => {
    if (diff.op === 'add') {
      transaction.createIfNotExists({
        _id: diff.id,
        _type: diff.type,
        ...diff.value,
      })
    } else if (diff.op === 'remove') {
      transaction.delete(diff.id)
    } else if (diff.op === 'modify') {
      diff.patches.forEach((patch) => {
        const path = compact(patch.path.split('/')).join('.')
        const patchObject: PatchOperations = {}
        if (patch.op === 'add') {
          patchObject.setIfMissing = {[path]: patch.value}
        } else if (patch.op === 'replace') {
          patchObject.set = {[path]: patch.value}
        } else if (patch.op === 'remove') {
          patchObject.unset = [path]
        }
        transaction.patch(diff.id, patchObject)
      })
    }
  })
  return sanityClient.mutate<R>(transaction)
}
