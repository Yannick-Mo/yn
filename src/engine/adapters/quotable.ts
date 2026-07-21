import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

export class QuotableAdapter extends BaseAdapter {
  readonly name = "quotable"
  readonly label = "Quotable"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const res = await fetch("https://api.quotable.io/random")
    const data = await res.json()

    return {
      id: data._id || this.generateId(),
      content: data.content,
      author: data.author || undefined,
      source: this.name,
      type: data.tags?.[0],
      fetchedAt: Date.now(),
    }
  }
}
