import { useEffect, useState, useCallback } from "react"
import { listen, emit } from "@tauri-apps/api/event"
import { removeFavorite, exportFavorites, getFavorites } from "../../lib/db"
import type { Favorite } from "../../lib/db"

export default function FavoritesPage() {
  const [items, setItems] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [exportMsg, setExportMsg] = useState("")

  const loadFromDb = async () => {
    setLoading(true)
    const favs = await getFavorites()
    setItems(favs)
    setLoading(false)
  }

  useEffect(() => {
    loadFromDb()
    const unlisten = listen<Favorite[]>("favorites:sync", () => { loadFromDb() })
    return () => { unlisten.then((fn) => fn()) }
  }, [])

  const handleRemove = async (id: string) => {
    const ok = await removeFavorite(id)
    if (!ok) return
    setItems((prev) => prev.filter((f) => f.sentence_id !== id))
    const favs = await getFavorites()
    emit("favorites:sync", favs)
  }

  const handleExport = useCallback(async (format: "json" | "csv" | "txt") => {
    try {
      setExportMsg("正在导出...")
      const text = await exportFavorites(format)
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `yn-favorites.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      setExportMsg(`已导出 ${format.toUpperCase()} 文件`)
      setTimeout(() => setExportMsg(""), 3000)
    } catch (err) {
      setExportMsg(`导出失败: ${err}`)
      console.error("export failed:", err)
    }
  }, [])

  if (loading) return (
    <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>加载中...</p>
  )

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium">收藏 ({items.length})</h2>
        {items.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: "var(--main-text-dim)" }}>{exportMsg}</span>
            <button onClick={() => handleExport("json")} className="text-xs rounded px-2 py-1 border" style={{ color: "var(--main-text-dim)", borderColor: "var(--main-border)" }}>JSON</button>
            <button onClick={() => handleExport("csv")} className="text-xs rounded px-2 py-1 border" style={{ color: "var(--main-text-dim)", borderColor: "var(--main-border)" }}>CSV</button>
            <button onClick={() => handleExport("txt")} className="text-xs rounded px-2 py-1 border" style={{ color: "var(--main-text-dim)", borderColor: "var(--main-border)" }}>TXT</button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>暂无收藏。点击悬浮面板上的 🤍 即可收藏句子。</p>
      ) : (
        <div className="space-y-2">
          {items.map((f) => (
            <div key={f.sentence_id} className="rounded px-4 py-3 flex items-start justify-between gap-3" style={{ background: "var(--main-surface)" }}>
              <div className="min-w-0">
                <p className="text-sm" style={{ color: "var(--main-text)" }}>{f.content}</p>
                <p className="text-xs mt-1" style={{ color: "var(--main-text-dim)" }}>
                  {[f.author, f.from_text, f.source].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                onClick={() => handleRemove(f.sentence_id)}
                className="text-xs shrink-0 mt-1" style={{ color: "var(--main-accent)" }}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
