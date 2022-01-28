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

  const onFixIdStructureMismatchDocuments = React.useCallback(async () => {
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

  const onFixTranslationRefs = React.useCallback(async () => {
    setPending(true)
    const diffs = await fixTranslationRefs(selectedSchema, baseDocuments, translatedDocuments)
    setDiffRequests(diffs)
    setPending(false)
  }, [selectedSchema, baseDocuments, translatedDocuments, setPending])

  const onFixBaseDocumntRefs = React.useCallback(async () => {
    setPending(true)
    await fixBaseDocumentRefs(selectedSchema, translatedDocuments)
    await fetchInformation(selectedSchema)
  }, [selectedSchema, translatedDocuments])

  const onFixOrphanDocuments = React.useCallback(async () => {
    setPending(true)
    await fixOrphanedDocuments(baseDocuments, translatedDocuments)
    await fetchInformation(selectedSchema)
  }, [selectedSchema, baseDocuments, translatedDocuments, fetchInformation])

  const onFixReferenceBehaviorMismatch = React.useCallback(async () => {
    setPending(true)
    await fixTranslationRefs(selectedSchema, baseDocuments, translatedDocuments)
    await fetchInformation(selectedSchema)
  }, [selectedSchema, baseDocuments, translatedDocuments])

  const onFixBaseLanguageMismatch = React.useCallback(async () => {
    setPending(true)
    await fixBaseLanguageMismatch(selectedSchema, baseDocuments)
    await fetchInformation(selectedSchema)
  }, [selectedSchema, baseDocuments, fetchInformation])

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
                onClick={onFixIdStructureMismatchDocuments}
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
                onClick={onFixTranslationRefs}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.missingBaseDocumentRefs.length}
                labelName="missingBaseDocumentRefs"
                onClick={onFixBaseDocumntRefs}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.orphanDocuments.length}
                labelName="orphanDocuments"
                onClick={onFixOrphanDocuments}
              />
              <MaintenanceTabResult
                pending={pending}
                count={documentsSummaryInformation.referenceBehaviorMismatch.length}
                labelName="referenceBehaviorMismatch"
                onClick={onFixReferenceBehaviorMismatch}
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
