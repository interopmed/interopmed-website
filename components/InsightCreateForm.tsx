import InsightEditorForm from './InsightEditorForm'

type InsightCreateFormProps = {
  taxonomyOptions?: {
    categories: string[]
    tags: string[]
  }
}

export default function InsightCreateForm({ taxonomyOptions }: InsightCreateFormProps) {
  return <InsightEditorForm mode="create" taxonomyOptions={taxonomyOptions} />
}
