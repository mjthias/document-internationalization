import chunk from 'just-split'
import compact from 'just-compact'
import {ReferenceBehavior} from '../../constants'
import {DocumentDiff, Ti18nDocument} from '../../types'
import {createSanityReference, getBaseIdFromId, getConfig} from '../../utils'

export const fixBaseDocumentRefs = async (
  schema: string,
  translatedDocuments: Ti18nDocument[]
): Promise<DocumentDiff[][]> => {
  const config = getConfig(schema)
  if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
    const baseRefFieldName = config.fieldNames.baseReference
    const diffs = compact(
      translatedDocuments.map<DocumentDiff | null>((doc) => {
        if (!doc[baseRefFieldName]) {
          const baseId = getBaseIdFromId(doc._id)
          return {
            op: 'modify',
            id: doc._id,
            type: doc._type,
            patches: [
              {
                op: 'add',
                path: baseRefFieldName,
                value: createSanityReference(
                  baseId,
                  config.referenceBehavior === ReferenceBehavior.WEAK
                ),
              },
            ],
          }
        }
        return null
      })
    )
    return chunk(diffs, 100)
  }
  return []
}
