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

  const diffs = baseDocuments.map<DocumentDiff>((doc) => {
    let translatedRefs: ITranslationRef[] = []
    const relevantTranslations = translatedDocuments.filter(
      (dx) => getBaseIdFromId(dx._id) === doc._id
    )
    if (config.referenceBehavior !== ReferenceBehavior.DISABLED) {
      translatedRefs = _.compact(
        relevantTranslations.map((translation) => {
          const lang = getLanguageFromId(translation._id)
          if (!lang) return null
          return {
            _key: lang,
            ...createSanityReference(
              translation._id,
              config.referenceBehavior === ReferenceBehavior.WEAK
            ),
          }
        }, {})
      )
    }
    return {
      op: 'modify',
      id: doc._id,
      type: doc._type,
      patches: [
        {
          op: 'replace',
          path: refsFieldName,
          value: translatedRefs,
        },
      ],
    }
  }, [])
  return chunk(diffs, 100)
}
