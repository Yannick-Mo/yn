import { useEffect, useState } from "react"
import { isAutostartEnabled, setAutostart } from "../../lib/ipc"

export default function AdvancedPage() {
  const [autoStart, setAutoStart] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    isAutostartEnabled()
      .then((enabled) => {
        setAutoStart(enabled)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleAutostart = async () => {
    const next = !autoStart
    try {
      await setAutostart(next)
      setAutoStart(next)
    } catch (err) {
      console.error("toggleAutostart failed:", err)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-base font-medium mb-4">高级设置</h2>

      <div className="space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-sm" style={{ color: "var(--main-text)" }}>开机自启</span>
          {loading ? (
            <span className="text-xs" style={{ color: "var(--main-text-dim)" }}>加载中...</span>
          ) : (
            <input
              type="checkbox"
              checked={autoStart}
              onChange={toggleAutostart}
              className="accent-blue-500"
            />
          )}
        </label>
      </div>
    </div>
  )
}
