import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

export class JinrishiciAdapter extends BaseAdapter {
  readonly name = "jinrishici"
  readonly label = "今日诗词"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const res = await fetch("https://v1.jinrishici.com/all.json")
    const data = await res.json()

    return {
      id: this.generateId(),
      content: data.content,
      author: data.author || undefined,
      from: data.origin || undefined,
      source: this.name,
      type: data.category,
      fetchedAt: Date.now(),
    }
  }
}
