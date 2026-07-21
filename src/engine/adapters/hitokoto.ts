import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

export class HitokotoAdapter extends BaseAdapter {
  readonly name = "hitokoto"
  readonly label = "一言-Hitokoto"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const params = new URLSearchParams()
    const c = this.config.params?.c
    if (c) params.set("c", c)

    const url = `https://v1.hitokoto.cn${params.toString() ? "?" + params.toString() : ""}`
    const res = await fetch(url)
    const data = await res.json()

    return {
      id: data.uuid || this.generateId(),
      content: data.hitokoto,
      author: data.from_who || undefined,
      from: data.from || undefined,
      source: this.name,
      type: data.type,
      fetchedAt: Date.now(),
    }
  }
}
