import chunk from 'just-split'
import compact from 'just-compact'
import {DocumentDiff, Ti18nDocument} from '../../types'
import {getBaseLanguage, getConfig, getLanguagesFromOption} from '../../utils'

export const fixBaseLanguageMismatch = async (
  schema: string,
  basedocuments: Ti18nDocument[]
): Promise<DocumentDiff[][]> => {
  const config = getConfig(schema)
  const languages = await getLanguagesFromOption(config.languages)
  const base = getBaseLanguage(languages, config.base)
  const langFieldName = config.fieldNames.lang
  if (base) {
    const diffs = compact(
      basedocuments.map<DocumentDiff | null>((doc) => {
        if (doc[langFieldName] !== config.base) {
          return {
            op: 'modify',
            id: doc._id,
            type: doc._type,
            patches: [
              {
                op: 'replace',
                path: langFieldName,
                oldValue: doc[langFieldName],
                value: base.id,
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
