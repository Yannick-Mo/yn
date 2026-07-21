export interface Sentence {
  id: string
  content: string
  translation?: string
  author?: string
  source: string
  from?: string
  type?: string
  fetchedAt: number
}

export type SourceStrategy = "single" | "random" | "round-robin"

export interface SourceConfig {
  name: string
  enabled: boolean
  params?: Record<string, string>
}

export interface CustomSourceConfig {
  id: string
  label: string
  url: string
  method: "GET" | "POST"
  headers: Record<string, string>
  contentPath: string
  authorPath?: string
  translationPath?: string
  fromPath?: string
}
