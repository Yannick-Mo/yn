import { useEffect, useState } from "react"
import { listen, emit } from "@tauri-apps/api/event"
import { useFavoriteStore } from "../../stores/favoriteStore"
import { removeFavorite, exportFavorites } from "../../lib/db"
import type { Favorite } from "../../lib/db"

export default function FavoritesPage() {
  const storeItems = useFavoriteStore((s) => s.items)
  const setStoreItems = useFavoriteStore((s) => s.setItems)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (storeItems.length > 0) {
      setLoading(false)
    }
  }, [storeItems])

  useEffect(() => {
    emit("favorites:request")
    const unlisten = listen<Favorite[]>("favorites:sync", (event) => {
      setStoreItems(event.payload)
      setLoading(false)
    })
    return () => { unlisten.then((fn) => fn()) }
  }, [])

  const handleRemove = async (id: string) => {
    await removeFavorite(id)
    setStoreItems(storeItems.filter((f) => f.sentence_id !== id))
  }

  const handleExport = async (format: "json" | "csv" | "txt") => {
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
  }

  if (loading) return <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>加载中...</p>

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium">收藏 ({storeItems.length})</h2>
        {storeItems.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => handleExport("json")} className="text-xs rounded px-2 py-1" style={{ color: "var(--main-text-dim)", borderColor: "var(--main-border)" }}>JSON</button>
            <button onClick={() => handleExport("csv")} className="text-xs rounded px-2 py-1" style={{ color: "var(--main-text-dim)", borderColor: "var(--main-border)" }}>CSV</button>
            <button onClick={() => handleExport("txt")} className="text-xs rounded px-2 py-1" style={{ color: "var(--main-text-dim)", borderColor: "var(--main-border)" }}>TXT</button>
          </div>
        )}
      </div>

      {storeItems.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>暂无收藏。点击悬浮面板上的 🤍 即可收藏句子。</p>
      ) : (
        <div className="space-y-2">
          {storeItems.map((f) => (
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
