import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

export class HitokotoAdapter extends BaseAdapter {
  readonly name = "hitokoto"
  readonly label = "一言-Hitokoto"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const params = new URLSearchParams()
      const c = this.config.params?.c
      if (c) params.set("c", c)

      const url = `https://v1.hitokoto.cn${params.toString() ? "?" + params.toString() : ""}`
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`一言 API 返回 HTTP ${res.status}`)
      const data = await res.json()

      if (!data || !data.hitokoto) throw new Error("一言 API 返回数据格式异常")

      return {
        id: data.uuid || this.generateId(),
        content: data.hitokoto,
        author: data.from_who || undefined,
        from: data.from || undefined,
        source: this.name,
        type: data.type,
        fetchedAt: Date.now(),
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("一言 API 请求超时")
      }
      if (err instanceof TypeError) {
        throw new Error("一言 API 网络不可达，请检查网络连接")
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }
}
