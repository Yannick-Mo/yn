import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

export class ZenQuotesAdapter extends BaseAdapter {
  readonly name = "zenquotes"
  readonly label = "ZenQuotes"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const res = await fetch("https://zenquotes.io/api/random")
    const data = await res.json()
    const item = Array.isArray(data) ? data[0] : data

    return {
      id: this.generateId(),
      content: item.q,
      author: item.a || undefined,
      source: this.name,
      fetchedAt: Date.now(),
    }
  }
}
