import type { SourceAdapter } from "./adapter"
import type { SourceStrategy } from "./types"
import { LocalAdapter } from "./adapters/local"
import { HitokotoAdapter } from "./adapters/hitokoto"
import { JinrishiciAdapter } from "./adapters/jinrishici"
import { ZenQuotesAdapter } from "./adapters/zenquotes"
import { QuotableAdapter } from "./adapters/quotable"

export class SourceRegistry {
  private adapters: Map<string, SourceAdapter> = new Map()
  private strategy: SourceStrategy = "random"
  private roundRobinIndex = 0

  constructor() {
    this.registerDefault()
  }

  private registerDefault() {
    this.register(new LocalAdapter({ name: "local", enabled: true }))
    this.register(new HitokotoAdapter({ name: "hitokoto", enabled: false }))
    this.register(new JinrishiciAdapter({ name: "jinrishici", enabled: false }))
    this.register(new ZenQuotesAdapter({ name: "zenquotes", enabled: false }))
    this.register(new QuotableAdapter({ name: "quotable", enabled: false }))
  }

  register(adapter: SourceAdapter) {
    this.adapters.set(adapter.name, adapter)
  }

  get(name: string): SourceAdapter | undefined {
    return this.adapters.get(name)
  }

  getAll(): SourceAdapter[] {
    return Array.from(this.adapters.values())
  }

  getEnabled(): SourceAdapter[] {
    return this.getAll().filter((a) => a.config.enabled)
  }

  setStrategy(strategy: SourceStrategy) {
    this.strategy = strategy
  }

  selectAdapter(): SourceAdapter | null {
    const enabled = this.getEnabled()
    if (enabled.length === 0) return null

    switch (this.strategy) {
      case "single":
        return enabled[0]
      case "random": {
        return enabled[Math.floor(Math.random() * enabled.length)]
      }
      case "round-robin": {
        const idx = this.roundRobinIndex % enabled.length
        this.roundRobinIndex = idx + 1
        return enabled[idx]
      }
      default:
        return enabled[0]
    }
  }

  async fetchSentence(): Promise<{ sentence?: import("./types").Sentence; error?: string }> {
    const adapter = this.selectAdapter()
    if (!adapter) return { error: "No enabled sources" }

    try {
      const sentence = await adapter.fetch()
      return { sentence }
    } catch (err) {
      return { error: String(err) }
    }
  }
}
