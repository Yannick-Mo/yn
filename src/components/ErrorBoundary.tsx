import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-screen w-screen flex items-center justify-center"
          style={{ background: "var(--main-bg-start, #0f172a)", color: "var(--main-text, #fff)" }}>
          <div className="text-center max-w-md px-6">
            <p className="text-lg mb-2">Something went wrong</p>
            <p className="text-sm opacity-60 mb-4">{this.state.error.message}</p>
            <button
              onClick={() => this.setState({ error: null })}
              className="text-sm px-4 py-2 rounded"
              style={{ background: "var(--main-accent, #3b82f6)", color: "#fff" }}
            >
              Retry
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
