import { BaseAdapter } from "../adapter"
import type { Sentence, SourceConfig } from "../types"

export class XygengAdapter extends BaseAdapter {
  readonly name = "xygeng"
  readonly label = "一个 · ONE"

  constructor(config: SourceConfig) {
    super(config)
  }

  async fetch(): Promise<Sentence> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const res = await fetch("https://api.xygeng.cn/one", { signal: controller.signal })
      if (!res.ok) throw new Error(`ONE API 返回 HTTP ${res.status}`)
      const body = await res.json()

      if (body.code !== 200 || !body.data?.content) throw new Error("ONE API 返回数据格式异常")

      const d = body.data

      return {
        id: String(d.id) || this.generateId(),
        content: d.content,
        author: d.name || undefined,
        from: d.origin || undefined,
        source: this.name,
        type: d.tag || undefined,
        fetchedAt: Date.now(),
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("ONE API 请求超时")
      }
      if (err instanceof TypeError) {
        throw new Error("ONE API 网络不可达，请检查网络连接")
      }
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }
}
