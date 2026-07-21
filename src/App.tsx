import { useEffect, useState } from "react"
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow"
import { check } from "@tauri-apps/plugin-updater"
import { ask } from "@tauri-apps/plugin-dialog"
import { ErrorBoundary } from "./components/ErrorBoundary"
import FloatingPanel from "./pages/FloatingPanel"
import MainWindow from "./pages/MainWindow"
import Fallback from "./pages/Fallback"

type WindowLabel = "main" | "floating" | "unknown"

function isWindowLabel(label: string): label is WindowLabel {
  return label === "main" || label === "floating" || label === "unknown"
}

export default function App() {
  const [label, setLabel] = useState<WindowLabel>("unknown")

  useEffect(() => {
    const win = getCurrentWebviewWindow()
    if (isWindowLabel(win.label)) {
      setLabel(win.label)
    }

    if (win.label === "main") {
      checkForUpdate()
    }
  }, [])

  return (
    <ErrorBoundary>
      {label === "floating" && <FloatingPanel />}
      {label === "main" && <MainWindow />}
      {label === "unknown" && <Fallback />}
    </ErrorBoundary>
  )
}

async function checkForUpdate() {
  try {
    const update = await check()
    if (update?.available) {
      const yes = await ask(`发现新版本 ${update.version}，是否更新？`, {
        title: "YN · 一念",
        kind: "info",
      })
      if (yes) {
        await update.downloadAndInstall()
      }
    }
  } catch {
    // silently fail — no network or no updater configured
  }
}
