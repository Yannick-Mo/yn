import { useSentenceStore } from "../../stores/sentenceStore"
import { useConfigStore } from "../../stores/configStore"

export default function SourcesPage() {
  const { config, update } = useConfigStore()
  const registry = useSentenceStore((s) => s.registry)

  if (!config) return <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>加载中...</p>

  const adapters = registry.getAll()
  const enabledSet = new Set(config.enabled_sources)

  return (
    <div className="max-w-lg">
      <h2 className="text-base font-medium mb-4">句子来源</h2>
      <div className="space-y-3">
        {adapters.map((adapter) => (
          <div key={adapter.name} className="flex items-center justify-between rounded px-4 py-3" style={{ background: "var(--main-surface)" }}>
            <div>
              <p className="text-sm">{adapter.label}</p>
              <p className="text-xs" style={{ color: "var(--main-text-dim)" }}>{adapter.name}</p>
            </div>
            <input
              type="checkbox"
              checked={enabledSet.has(adapter.name)}
              onChange={() => {
                const currentlyEnabled = enabledSet.has(adapter.name)
                const enabled = currentlyEnabled
                  ? config.enabled_sources.filter((n) => n !== adapter.name)
                  : [...config.enabled_sources, adapter.name]
                update({ enabled_sources: enabled })
              }}
              className="accent-blue-500"
            />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <label className="text-sm block mb-1" style={{ color: "var(--main-text)" }}>选择策略</label>
        <select
          value={config.source_strategy}
          onChange={(e) => update({ source_strategy: e.target.value })}
          className="w-full rounded px-3 py-2 text-sm"
        >
          <option value="random">随机来源</option>
          <option value="single">固定来源</option>
          <option value="round-robin">轮询</option>
        </select>
      </div>
    </div>
  )
}
