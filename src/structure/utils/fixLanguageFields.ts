import compact from 'just-compact'
import {Ti18nDocument, Ti18nSchema, DocumentDiff} from '../../types'
import {
  getBaseLanguage,
  getConfig,
  getLanguageFromId,
  getLanguagesFromOption,
  getSchema,
} from '../../utils'

export const fixLanguageFields = async (
  schema: string,
  documents: Ti18nDocument[]
): Promise<DocumentDiff[]> => {
  const config = getConfig(schema)
  const languages = await getLanguagesFromOption(config.languages)
  const langFieldName = config.fieldNames?.lang

  return compact(
    documents.map<DocumentDiff | null>((doc) => {
      const schemaObject = getSchema<Ti18nSchema>(doc._type)
      const base =
        (typeof schemaObject.i18n === 'object' ? schemaObject.i18n.base : undefined) ||
        getBaseLanguage(languages, config.base)?.id
      const language = getLanguageFromId(doc._id) || base
      if (schemaObject.i18n && language && !doc[langFieldName]) {
        return {
          op: 'modify',
          id: doc._id,
          type: doc._type,
          patches: [
            {
              op: 'add',
              path: langFieldName,
              value: language,
            },
          ],
        }
      }
      return null
    })
  )
}
