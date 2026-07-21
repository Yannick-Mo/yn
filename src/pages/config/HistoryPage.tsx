import { useSentenceStore } from "../../stores/sentenceStore"

export default function HistoryPage() {
  const history = useSentenceStore((s) => s.history)
  const clearHistory = useSentenceStore((s) => s.clearHistory)

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium">历史记录 ({history.length})</h2>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs" style={{ color: "var(--main-accent)" }}
          >
            清空
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>暂无历史记录。</p>
      ) : (
        <div className="space-y-2">
          {history.map((s, i) => (
            <div key={`${s.id}-${i}`} className="rounded px-4 py-3" style={{ background: "var(--main-surface)" }}>
              <p className="text-sm" style={{ color: "var(--main-text)" }}>{s.content}</p>
              <p className="text-xs mt-1" style={{ color: "var(--main-text-dim)" }}>
                {[s.author, s.source].filter(Boolean).join(" · ")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
