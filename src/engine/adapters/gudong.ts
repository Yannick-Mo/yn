import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

export class GudongAdapter extends BaseAdapter {
  readonly name = "gudong"
  readonly label = "咕咚智慧语录"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch("https://card.gudong.site/api/random-note", { signal: controller.signal })
      if (!res.ok) throw new Error(`咕咚 API 返回 HTTP ${res.status}`)
      const data = await res.json()

      if (!data || !data.content) throw new Error("咕咚 API 返回数据格式异常")

      return {
        id: data.id || this.generateId(),
        content: data.content,
        author: data.author || undefined,
        from: data.source || undefined,
        source: this.name,
        fetchedAt: Date.now(),
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("咕咚 API 请求超时")
      }
      if (err instanceof TypeError) {
        throw new Error("咕咚 API 网络不可达，请检查网络连接")
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }
}
