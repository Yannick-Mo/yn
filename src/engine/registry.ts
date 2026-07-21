import type { SourceAdapter } from "./adapter"
import type { SourceStrategy, Sentence } from "./types"
import { LocalAdapter } from "./adapters/local"
import { HitokotoAdapter } from "./adapters/hitokoto"
import { JinrishiciAdapter } from "./adapters/jinrishici"
import { QuotableAdapter } from "./adapters/quotable"
import { GudongAdapter } from "./adapters/gudong"
import { XygengAdapter } from "./adapters/xygeng"

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
    this.register(new QuotableAdapter({ name: "quotable", enabled: false }))
    this.register(new GudongAdapter({ name: "gudong", enabled: false }))
    this.register(new XygengAdapter({ name: "xygeng", enabled: false }))
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

    const idx = this.pickIndex(enabled.length)
    return enabled[idx] ?? null
  }

  async fetchSentence(): Promise<{ sentence?: Sentence; error?: string }> {
    const enabled = this.getEnabled()
    if (enabled.length === 0) return { error: "没有启用的来源" }

    const startIdx = this.pickIndex(enabled.length)
    for (let i = 0; i < enabled.length; i++) {
      const idx = (startIdx + i) % enabled.length
      const adapter = enabled[idx]!
      try {
        const sentence = await adapter.fetch()
        return { sentence }
      } catch (err) {
        if (i === enabled.length - 1) {
          return { error: String(err) }
        }
      }
    }

    return { error: "所有来源均加载失败" }
  }

  private pickIndex(len: number): number {
    switch (this.strategy) {
      case "single":
        return 0
      case "random":
        return Math.floor(Math.random() * len)
      case "round-robin": {
        const idx = this.roundRobinIndex % len
        this.roundRobinIndex = idx + 1
        return idx
      }
      default:
        return 0
    }
  }
}
