import _ from 'lodash'
import chunk from 'just-split'
import {ReferenceBehavior} from '../../constants'
import {DocumentDiff, ITranslationRef, Ti18nDocument} from '../../types'
import {createSanityReference, getBaseIdFromId, getConfig, getLanguageFromId} from '../../utils'

export const fixTranslationRefs = async (
  schema: string,
  baseDocuments: Ti18nDocument[],
  translatedDocuments: Ti18nDocument[]
): Promise<DocumentDiff[][]> => {
  const config = getConfig(schema)
  const refsFieldName = config.fieldNames.references

  return chunk(baseDocuments, 100).reduce<DocumentDiff[][]>((acc, documentsChunk) => {
    const diffChunk = documentsChunk.map<DocumentDiff>((d) => {
      let translatedRefs: ITranslationRef[] = []
      const relevantTranslations = translatedDocuments.filter(
        (dx) => getBaseIdFromId(dx._id) === d._id
      )
      if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
        translatedRefs = _.compact(
          relevantTranslations.map((doc) => {
            const lang = getLanguageFromId(doc._id)
            if (!lang) return null
            return {
              _key: lang,
              ...createSanityReference(
                doc._id,
                config.referenceBehavior === ReferenceBehavior.WEAK
              ),
            }
          }, {})
        )
      }
      return {
        op: 'modify',
        id: d._id,
        type: d._type,
        patches: [
          {
            op: 'replace',
            path: refsFieldName,
            value: translatedRefs,
          },
        ],
      }
    })
    acc.push(diffChunk)
    return acc
  }, [])
}
