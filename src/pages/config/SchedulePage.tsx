import { useConfigStore } from "../../stores/configStore"

const INTERVAL_OPTIONS = [
  { value: 300000, label: "5 分钟" },
  { value: 900000, label: "15 分钟" },
  { value: 1800000, label: "30 分钟" },
  { value: 3600000, label: "1 小时" },
  { value: 7200000, label: "2 小时" },
]

export default function SchedulePage() {
  const { config, update } = useConfigStore()

  if (!config) return <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>加载中...</p>

  return (
    <div className="max-w-lg">
      <h2 className="text-base font-medium mb-4">定时设置</h2>
      <div>
        <label className="text-sm block mb-1" style={{ color: "var(--main-text)" }}>自动更新间隔</label>
        <select
          value={config.update_interval_ms}
          onChange={(e) => update({ update_interval_ms: Number(e.target.value) })}
          className="w-full rounded px-3 py-2 text-sm"
        >
          {INTERVAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
