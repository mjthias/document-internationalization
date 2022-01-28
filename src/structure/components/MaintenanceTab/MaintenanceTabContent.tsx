import React from 'react'
import {Stack, Box, Container} from '@sanity/ui'
import {MaintenanceTabTypeSelector} from '../MaintenanceTabTypeSelector'
import {useDocumentsInformation} from '../../hooks'
import {MaintenanceTabResult} from '../MaintenanceTabResult'
import {
  fixBaseDocumentRefs,
  fixBaseLanguageMismatch,
  fixIdStructureMismatchDocuments,
  fixLanguageFields,
  fixOrphanedDocuments,
  fixTranslationRefs,
} from '../../utils'
import {DocumentDiff} from '../../../types'
import {applyDocumentDiffs} from '../../utils/applyDocumentDiff'
import {MaintenanceTabDiffDialog} from './MaintenanceTabDiffDialog'

export const MaintenanceTabContent = () => {
  const [selectedSchema, setSelectedSchema] = React.useState('')
  const [diffRequests, setDiffRequests] = React.useState<DocumentDiff[][]>([])
  const {
    pending,
    setPending,
    documents,
    baseDocuments,
    translatedDocuments,
    documentsSummaryInformation,
    fetchInformation,
  } = useDocumentsInformation(selectedSchema)

  const onSchemaTypeChange = React.useCallback(
    (schemaName: string) => setSelectedSchema(schemaName),
    [selectedSchema]
  )

  const handleOpen = React.useCallback(() => setSelectedSchema(''), [selectedSchema])

  const handleFixIdStructureMismatchDocuments = React.useCallback(async () => {
    setPending(true)
    const diffs = await fixIdStructureMismatchDocuments(selectedSchema, documents)
    setDiffRequests(diffs)
    setPending(false)
  }, [selectedSchema, documents, setPending])

  const handleFixMissingLanguageFields = React.useCallback(async () => {
    setPending(true)
    const diffs = await fixLanguageFields(selectedSchema, documents)
    setDiffRequests(diffs)
    setPending(false)
  }, [selectedSchema, documents, setPending])

  const handleFixTranslationRefs = React.useCallback(async () => {
    setPending(true)
    const diffs = await fixTranslationRefs(selectedSchema, baseDocuments, translatedDocuments)
    setDiffRequests(diffs)
    setPending(false)
  }, [selectedSchema, baseDocuments, translatedDocuments, setPending])

  const handleFixBaseDocumntRefs = React.useCallback(async () => {
    setPending(true)
    const diffs = await fixBaseDocumentRefs(selectedSchema, translatedDocuments)
    setDiffRequests(diffs)
    setPending(false)
  }, [selectedSchema, translatedDocuments, setPending])

  const handleFixOrphanDocuments = React.useCallback(async () => {
    setPending(true)
    const diffs = await fixOrphanedDocuments(baseDocuments, translatedDocuments)
    setDiffRequests(diffs)
    setPending(false)
  }, [baseDocuments, translatedDocuments, setPending])

  const handleFixReferenceBehaviorMismatch = React.useCallback(async () => {
    setPending(true)
    const diffs = await fixTranslationRefs(selectedSchema, baseDocuments, translatedDocuments)
    setDiffRequests(diffs)
    setPending(false)
  }, [selectedSchema, baseDocuments, translatedDocuments, setPending])

  const onFixBaseLanguageMismatch = React.useCallback(async () => {
    setPending(true)
    const diffs = await fixBaseLanguageMismatch(selectedSchema, baseDocuments)
    setDiffRequests(diffs)
    setPending(false)
  }, [selectedSchema, baseDocuments, setPending])

  const handleDiffOverviewConfirm = React.useCallback(
    async (diffs: DocumentDiff[][]) => {
      for (let i = 0; i < diffs.length; i++) {
        await applyDocumentDiffs(diffs[i])
      }
      await fetchInformation(selectedSchema)
      setDiffRequests([])
    },
    [selectedSchema, fetchInformation]
  )

  const handleDiffOverviewClose = React.useCallback(() => {
    setDiffRequests([])
  }, [diffRequests])

  return (
    <Container width={1}>
      <Stack space={2}>
        <Box padding={4}>
          <MaintenanceTabTypeSelector
            value={selectedSchema}
            onChange={onSchemaTypeChange}
            onOpen={handleOpen}
          />
        </Box>
        {!!selectedSchema && (
          <Box paddingX={4}>
            <Stack space={2}>
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.idStructureMismatch.length}
                labelName="idStructureMismatch"
                onClick={handleFixIdStructureMismatchDocuments}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingLanguageField.length}
                labelName="missingLanguageField"
                onClick={handleFixMissingLanguageFields}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingDocumentRefs.length}
                labelName="missingDocumentRefs"
                onClick={handleFixTranslationRefs}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingBaseDocumentRefs.length}
                labelName="missingBaseDocumentRefs"
                onClick={handleFixBaseDocumntRefs}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.orphanDocuments.length}
                labelName="orphanDocuments"
                onClick={handleFixOrphanDocuments}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.referenceBehaviorMismatch.length}
                labelName="referenceBehaviorMismatch"
                onClick={handleFixReferenceBehaviorMismatch}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.baseLanguageMismatch.length}
                labelName="baseLanguageMismatch"
                onClick={onFixBaseLanguageMismatch}
              />
            </Stack>
          </Box>
        )}
      </Stack>

      {!!diffRequests.length && (
        <MaintenanceTabDiffDialog
          diffs={diffRequests}
          onClose={handleDiffOverviewClose}
          onConfirm={handleDiffOverviewConfirm}
        />
      )}
    </Container>
  )
}
