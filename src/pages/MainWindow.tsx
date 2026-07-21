import { useEffect, useState } from "react"
import { listen } from "@tauri-apps/api/event"
import { useConfigStore } from "../stores/configStore"
import { useSentenceStore } from "../stores/sentenceStore"
import type { Sentence } from "../engine/types"
import DisplayPage from "./config/DisplayPage"
import SourcesPage from "./config/SourcesPage"
import SchedulePage from "./config/SchedulePage"
import FavoritesPage from "./config/FavoritesPage"
import HistoryPage from "./config/HistoryPage"
import AdvancedPage from "./config/AdvancedPage"

const PAGES = [
  { key: "display", label: "显示", icon: "🖥" },
  { key: "sources", label: "来源", icon: "📡" },
  { key: "schedule", label: "定时", icon: "⏱" },
  { key: "favorites", label: "收藏", icon: "❤" },
  { key: "history", label: "历史", icon: "📜" },
  { key: "advanced", label: "高级", icon: "⚙" },
] as const

type PageKey = (typeof PAGES)[number]["key"]

export default function MainWindow() {
  const [activePage, setActivePage] = useState<PageKey>("display")
  const loadConfig = useConfigStore((s) => s.load)
  const config = useConfigStore((s) => s.config)
  const registry = useSentenceStore((s) => s.registry)

  useEffect(() => {
    loadConfig()
  }, [])

  useEffect(() => {
    if (!config) return
    document.documentElement.setAttribute("data-theme", config.theme)
    const enabled = new Set(config.enabled_sources)
    for (const a of registry.getAll()) {
      a.config.enabled = enabled.has(a.name)
    }
    if (config.source_strategy === "single" || config.source_strategy === "random" || config.source_strategy === "round-robin") {
      registry.setStrategy(config.source_strategy)
    }
  }, [config])

  useEffect(() => {
    const unlisten = listen<Sentence>("sentence:new", (event) => {
      useSentenceStore.setState((state) => ({
        current: event.payload,
        history: [event.payload, ...state.history].slice(0, 100),
      }))
    })
    return () => { unlisten.then((fn) => fn()) }
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case "display": return <DisplayPage />
      case "sources": return <SourcesPage />
      case "schedule": return <SchedulePage />
      case "favorites": return <FavoritesPage />
      case "history": return <HistoryPage />
      case "advanced": return <AdvancedPage />
      default: return null
    }
  }

  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{
        background: "linear-gradient(to bottom right, var(--main-bg-start), var(--main-bg-end))",
        color: "var(--main-text)",
      }}
    >
      <header
        className="px-6 py-3 flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid var(--main-border)" }}
      >
        <h1 className="text-lg font-semibold">YN · 一念</h1>
        <span style={{ color: "var(--main-text-dim)", fontSize: "0.75rem" }}>
          {config ? `来源: ${config.enabled_sources.join(", ")}` : "加载中..."}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav
          className="w-44 py-3 shrink-0"
          style={{ borderRight: "1px solid var(--main-border)" }}
        >
          {PAGES.map((page) => (
            <button
              key={page.key}
              onClick={() => setActivePage(page.key)}
              className="w-full text-left px-5 py-2.5 text-sm transition-colors sidebar-btn"
              style={{
                color: activePage === page.key ? "var(--main-text)" : "var(--main-text-dim)",
                background: activePage === page.key ? "var(--main-surface)" : "transparent",
                fontWeight: activePage === page.key ? 500 : 400,
              }}
            >
              <span className="mr-2">{page.icon}</span>
              {page.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}
