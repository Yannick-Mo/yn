import { useEffect, useCallback, useState, useRef } from "react"
import { listen } from "@tauri-apps/api/event"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import { PhysicalPosition } from "@tauri-apps/api/dpi"
import { useSentenceStore } from "../stores/sentenceStore"
import { useConfigStore } from "../stores/configStore"
import { addFavorite, removeFavorite, isFavorited } from "../lib/db"
import type { AppConfig } from "../lib/ipc"
import type { SourceStrategy } from "../engine/types"

function hexToRgba(hex: string, alpha: number): string {
  let h = hex
  if (h.startsWith("#") && h.length === 4) {
    h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  }
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return ""
  return `rgba(${r},${g},${b},${alpha})`
}

function isLightColor(hex: string): boolean {
  let h = hex
  if (h.startsWith("#") && h.length === 4) {
    h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  }
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

function isSourceStrategy(v: string): v is SourceStrategy {
  return v === "single" || v === "random" || v === "round-robin"
}

function syncRegistry(reg: import("../engine").SourceRegistry, cfg: AppConfig) {
  const enabled = new Set(cfg.enabled_sources)
  for (const a of reg.getAll()) {
    a.config.enabled = enabled.has(a.name)
  }
  if (isSourceStrategy(cfg.source_strategy)) {
    reg.setStrategy(cfg.source_strategy)
  }
}

function applyPanelVars(cfg: AppConfig) {
  const root = document.documentElement

  const bgColor = cfg.panel_bg_color || "#000000"
  const light = isLightColor(bgColor)

  const bgRgba = hexToRgba(bgColor, cfg.panel_opacity)
  root.style.setProperty("--panel-bg", bgRgba || "rgba(0,0,0,0.3)")

  root.style.setProperty("--panel-text", cfg.panel_text_color || (light ? "#1a1a1a" : "rgba(255,255,255,0.9)"))
  root.style.setProperty("--panel-sub", cfg.panel_sub_color || (light ? "#666666" : "rgba(255,255,255,0.5)"))
  root.style.setProperty("--panel-error", light ? "#dc2626" : "rgba(252,165,165,0.7)")
  root.style.setProperty("--panel-btn-bg", light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)")
  root.style.setProperty("--panel-btn-hover", light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.15)")

  root.style.setProperty("--panel-blur-amount", String(cfg.panel_blur))
  root.style.setProperty("--panel-font-size", cfg.panel_font_size + "px")
  root.style.setProperty("--panel-sub-size", cfg.panel_sub_size + "px")
  root.style.setProperty("--panel-radius", cfg.panel_corner_radius + "px")

  const bWidth = cfg.panel_border_show ? cfg.panel_border_width + "px" : "0px"
  const bColor = cfg.panel_border_color || (light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.15)")
  root.style.setProperty("--panel-border", bWidth + " solid " + bColor)
}

export default function FloatingPanel() {
  const current = useSentenceStore((s) => s.current)
  const error = useSentenceStore((s) => s.error)
  const next = useSentenceStore((s) => s.next)
  const prev = useSentenceStore((s) => s.prev)
  const startAutoRefresh = useSentenceStore((s) => s.startAutoRefresh)
  const stopAutoRefresh = useSentenceStore((s) => s.stopAutoRefresh)
  const config = useConfigStore((s) => s.config)
  const update = useConfigStore((s) => s.update)
  const loadConfig = useConfigStore((s) => s.load)
  const registry = useSentenceStore((s) => s.registry)
  const [faved, setFaved] = useState(false)
  const [ready, setReady] = useState(false)
  const draggingRef = useRef(false)
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    loadConfig().then(() => {
      setReady(true)
      if (!current) next()
    })
  }, [])

  useEffect(() => {
    if (current) isFavorited(current.id).then(setFaved)
  }, [current?.id])

  const positionRestoredRef = useRef(false)

  useEffect(() => {
    if (!ready || !config) return
    const win = getCurrentWebviewWindow()
    if (config.panel_visible) {
      win.show()
    } else {
      win.hide()
    }
    applyPanelVars(config)
    syncRegistry(registry, config)
    if (!positionRestoredRef.current && config.panel_x != null && config.panel_y != null) {
      win.setPosition(new PhysicalPosition(config.panel_x, config.panel_y))
      positionRestoredRef.current = true
    }
    startAutoRefresh(config.update_interval_ms)
    return () => stopAutoRefresh()
  }, [ready, config])

  useEffect(() => {
    const unlisten = listen<AppConfig>("config:updated", (event) => {
      const cfg = event.payload
      applyPanelVars(cfg)
      useConfigStore.setState({ config: cfg })
      syncRegistry(registry, cfg)
      const win = getCurrentWebviewWindow()
      if (cfg.panel_visible) { win.show() } else { win.hide() }
    })
    return () => { unlisten.then((fn) => fn()) }
  }, [])

  useEffect(() => {
    const unlisten = listen<string>("shortcut:next", () => { next() })
    return () => { unlisten.then((fn) => fn()) }
  }, [next])

  useEffect(() => {
    const win = getCurrentWebviewWindow()
    const unlisten = win.onMoved(({ payload }) => {
      update({ panel_x: payload.x, panel_y: payload.y })
    })
    return () => { unlisten.then((fn) => fn()) }
  }, [update])

  const toggleFav = async () => {
    if (!current) return
    if (faved) {
      await removeFavorite(current.id)
      setFaved(false)
    } else {
      await addFavorite({
        sentence_id: current.id,
        content: current.content,
        author: current.author || null,
        source: current.source,
        from_text: current.from || null,
        type_text: current.type || null,
        translation: current.translation || null,
      })
      setFaved(true)
    }
  }

  const handleMouseDown = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    if (draggingRef.current) return
    draggingRef.current = true
    try {
      await getCurrentWebviewWindow().startDragging()
    } finally {
      draggingRef.current = false
    }
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (wheelTimerRef.current) return
    wheelTimerRef.current = setTimeout(() => {
      wheelTimerRef.current = null
    }, 300)
    if (e.deltaY > 0) next()
    else prev()
  }, [next, prev])

  const showNav = config?.panel_show_nav ?? true
  const fontSize = config?.panel_font_size ?? 16
  const subSize = config?.panel_sub_size ?? 12

  return (
    <div
      className="h-screen w-screen flex flex-col select-none overflow-hidden"
      style={{
        opacity: ready ? 1 : 0,
        backgroundColor: "var(--panel-bg)",
        backdropFilter: "blur(var(--panel-blur))",
        border: "var(--panel-border, none)",
        borderRadius: "var(--panel-radius, 0px)",
      }}
      onWheel={handleWheel}
    >
      <div
        className="h-5 shrink-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
        onMouseDown={handleMouseDown}
      >
        <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: "var(--panel-sub)" }} />
      </div>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-[320px] relative w-full">
          {error && (
            <p style={{ color: "var(--panel-error)", fontSize: subSize - 2 }}>{error}</p>
          )}
          {current && (
            <>
              <button
                onClick={toggleFav}
                className="absolute -top-1 right-0 leading-none"
                style={{
                  color: faved ? "#ef4444" : "var(--panel-sub)",
                  fontSize: fontSize + 4,
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {faved ? "♥" : "♡"}
              </button>

              <p
                className="leading-relaxed font-light italic"
                style={{ color: "var(--panel-text)", fontSize }}
              >
                &ldquo;{current.content}&rdquo;
              </p>
              {current.author && (
                <p className="mt-3" style={{ color: "var(--panel-sub)", fontSize: subSize }}>
                  — {current.author}
                </p>
              )}
              {current.from && (
                <p className="mt-1" style={{ color: "var(--panel-sub)", opacity: 0.6, fontSize: subSize - 2 }}>
                  {current.from}
                </p>
              )}
              {current.translation && (
                <p className="mt-3" style={{ color: "var(--panel-sub)", opacity: 0.8, fontSize: subSize }}>
                  {current.translation}
                </p>
              )}
            </>
          )}
          {!current && !error && (
            <p style={{ color: "var(--panel-sub)", fontSize: subSize }}>加载中...</p>
          )}
        </div>
      </div>

      {showNav && (
        <div
          className="flex items-center justify-center gap-10 pb-2.5"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={prev}
            className="flex items-center justify-center rounded-full transition-all hover-nav-btn"
            style={{
              width: fontSize + 16,
              height: fontSize + 16,
              color: "var(--panel-sub)",
              background: "var(--panel-btn-bg)",
              fontSize: fontSize - 2,
            }}
          >
            ◀
          </button>
          <button
            onClick={next}
            className="flex items-center justify-center rounded-full transition-all hover-nav-btn"
            style={{
              width: fontSize + 16,
              height: fontSize + 16,
              color: "var(--panel-sub)",
              background: "var(--panel-btn-bg)",
              fontSize: fontSize - 2,
            }}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  )
}
