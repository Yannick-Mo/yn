import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

export class ZenQuotesAdapter extends BaseAdapter {
  readonly name = "zenquotes"
  readonly label = "DummyJSON Quotes"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const skip = Math.floor(Math.random() * 1454)
      const res = await fetch(`https://dummyjson.com/quotes?limit=1&skip=${skip}`, { signal: controller.signal })
      if (!res.ok) throw new Error(`Quotes API returned HTTP ${res.status}`)
      const data = await res.json()
      const item = data.quotes?.[0]

      if (!item || !item.quote) throw new Error("Invalid response from Quotes API")

      return {
        id: String(item.id) || this.generateId(),
        content: item.quote,
        author: item.author || undefined,
        source: this.name,
        fetchedAt: Date.now(),
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("Quotes API request timed out")
      }
      if (err instanceof TypeError) {
        throw new Error("Quotes API unreachable, check your network")
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }
}
