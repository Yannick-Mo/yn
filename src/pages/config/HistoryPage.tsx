import { useEffect, useState } from "react"
import { getHistory, clearHistoryDb } from "../../lib/db"
import type { HistoryRecord } from "../../lib/db"

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const r = await getHistory()
    setRecords(r)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleClear = async () => {
    await clearHistoryDb()
    setRecords([])
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium">历史记录 ({records.length})</h2>
        {records.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs" style={{ color: "var(--main-accent)" }}
          >
            清空
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>加载中...</p>
      ) : records.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>暂无历史记录。</p>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={`${r.sentence_id}-${r.fetched_at}`} className="rounded px-4 py-3" style={{ background: "var(--main-surface)" }}>
              <p className="text-sm" style={{ color: "var(--main-text)" }}>{r.content}</p>
              <p className="text-xs mt-1" style={{ color: "var(--main-text-dim)" }}>
                {[r.author, r.source].filter(Boolean).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
