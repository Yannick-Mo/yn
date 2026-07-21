export default function Fallback() {
  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ background: "var(--main-surface)" }}>
      <p className="text-sm" style={{ color: "var(--main-text-dim)" }}>Loading...</p>
    </div>
  )
}
