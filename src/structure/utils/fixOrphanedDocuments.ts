import chunk from 'just-split'
import compact from 'just-compact'
import {DocumentDiff, Ti18nDocument} from '../../types'

export const fixOrphanedDocuments = async (
  basedocuments: Ti18nDocument[],
  translatedDocuments: Ti18nDocument[]
): Promise<DocumentDiff[][]> => {
  const diffs = compact(
    translatedDocuments.map<DocumentDiff | null>((translation) => {
      const base = basedocuments.find((doc) => translation._id.startsWith(doc._id))
      if (!base) {
        return {
          op: 'remove',
          id: translation._id,
          type: translation._type,
        }
      }
      return null
    })
  )
  return chunk(diffs, 100)
}
