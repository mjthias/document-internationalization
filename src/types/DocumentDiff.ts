type JSONPatchLike =
  | {
      op: 'add'
      path: string
      value: string | number | Record<string, any>
    }
  | {
      op: 'replace'
      path: string
      oldValue?: string | number | Record<string, any>
      value: string | number | Record<string, any>
    }
  | {
      op: 'remove'
      path: string
    }

export type DocumentDiff =
  | {
      op: 'modify'
      id: string
      type: string
      patches: JSONPatchLike[]
    }
  | {
      op: 'add'
      id: string
      type: string
      value: Record<string, any>
    }
  | {
      op: 'remove'
      id: string
      type: string
    }
