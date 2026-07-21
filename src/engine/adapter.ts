import type { Sentence, SourceConfig } from "./types"

export interface SourceAdapter {
  readonly name: string
  readonly label: string
  config: SourceConfig
  fetch(): Promise<Sentence>
}

export abstract class BaseAdapter implements SourceAdapter {
  abstract readonly name: string
  abstract readonly label: string
  config: SourceConfig

  constructor(config: SourceConfig) {
    this.config = config
  }

  abstract fetch(): Promise<Sentence>

  protected generateId(): string {
    return `${this.name}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }
}
