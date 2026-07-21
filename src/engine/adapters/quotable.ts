import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

export class QuotableAdapter extends BaseAdapter {
  readonly name = "quotable"
  readonly label = "DummyJSON Quotes"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch("https://dummyjson.com/quotes/random", { signal: controller.signal })
      if (!res.ok) throw new Error(`Quotes API returned HTTP ${res.status}`)
      const data = await res.json()

      if (!data || !data.quote) throw new Error("Invalid response from Quotes API")

      return {
        id: String(data.id) || this.generateId(),
        content: data.quote,
        author: data.author || undefined,
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
