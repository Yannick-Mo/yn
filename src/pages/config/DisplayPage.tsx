import { useConfigStore } from "../../stores/configStore"

const THEMES = [
  { value: "glass", label: "毛玻璃", desc: "半透明模糊背景" },
  { value: "minimal", label: "极简", desc: "纯白背景细体字" },
  { value: "warm", label: "暖色", desc: "浅米色暖调" },
  { value: "dark", label: "暗黑", desc: "深色柔和亮字" },
]

export default function DisplayPage() {
  const { config, update } = useConfigStore()

  if (!config) return <p style={{ color: "var(--main-text-dim)", fontSize: "0.75rem" }}>加载中...</p>

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-base font-medium" style={{ color: "var(--main-text)" }}>显示设置</h2>

      <GroupLabel>主程序设置</GroupLabel>
      <Section title="主题">
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => update({ theme: t.value })}
              className="text-left px-4 py-3 rounded border transition-colors"
              style={{
                borderColor: config.theme === t.value ? "var(--main-accent)" : "var(--main-border)",
                background:
                  config.theme === t.value
                    ? "color-mix(in srgb, var(--main-accent) 15%, transparent)"
                    : "var(--main-surface)",
                color: "var(--main-text)",
              }}
            >
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--main-text-dim)" }}>{t.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      <GroupLabel>悬浮面板设置</GroupLabel>
      <Section title="基础">
        <Toggle
          label="启用悬浮面板"
          checked={config.panel_visible}
          onChange={(v) => update({ panel_visible: v })}
        />
      </Section>

      <Divider />

      <Section title="背景">
        <Slider
          label={`透明度: ${Math.round(config.panel_opacity * 100)}%`}
          min={0} max={100} step={5}
          value={Math.round(config.panel_opacity * 100)}
          onChange={(v) => update({ panel_opacity: v / 100 })}
        />
        <Slider
          label={`模糊: ${Math.round(config.panel_blur)}px`}
          min={0} max={30} step={1}
          value={Math.round(config.panel_blur)}
          onChange={(v) => update({ panel_blur: v })}
        />
        <ColorPicker
          label="背景色"
          value={config.panel_bg_color || "#000000"}
          onChange={(v) => update({ panel_bg_color: v })}
          onReset={() => update({ panel_bg_color: null })}
          active={!!config.panel_bg_color}
        />
      </Section>

      <Divider />

      <Section title="边框">
        <Toggle
          label="显示边框"
          checked={config.panel_border_show}
          onChange={(v) => update({ panel_border_show: v })}
        />
        {config.panel_border_show && (
          <>
            <Slider
              label={`宽度: ${Math.round(config.panel_border_width)}px`}
              min={0} max={8} step={1}
              value={Math.round(config.panel_border_width)}
              onChange={(v) => update({ panel_border_width: v })}
            />
            <ColorPicker
              label="颜色"
              value={config.panel_border_color || "#ffffff"}
              onChange={(v) => update({ panel_border_color: v })}
              onReset={() => update({ panel_border_color: null })}
              active={!!config.panel_border_color}
            />
            <Slider
              label={`圆角: ${Math.round(config.panel_corner_radius)}px`}
              min={0} max={24} step={1}
              value={Math.round(config.panel_corner_radius)}
              onChange={(v) => update({ panel_corner_radius: v })}
            />
          </>
        )}
      </Section>

      <Divider />

      <Section title="字体">
        <Slider
          label={`句子: ${Math.round(config.panel_font_size)}px`}
          min={10} max={32} step={1}
          value={Math.round(config.panel_font_size)}
          onChange={(v) => update({ panel_font_size: v })}
        />
        <Slider
          label={`附属: ${Math.round(config.panel_sub_size)}px`}
          min={8} max={24} step={1}
          value={Math.round(config.panel_sub_size)}
          onChange={(v) => update({ panel_sub_size: v })}
        />
        <ColorPicker
          label="正文颜色"
          value={config.panel_text_color || "#ffffff"}
          onChange={(v) => update({ panel_text_color: v })}
          onReset={() => update({ panel_text_color: null })}
          active={!!config.panel_text_color}
        />
        <ColorPicker
          label="附属颜色"
          value={config.panel_sub_color || "#cccccc"}
          onChange={(v) => update({ panel_sub_color: v })}
          onReset={() => update({ panel_sub_color: null })}
          active={!!config.panel_sub_color}
        />
      </Section>

      <Divider />

      <Section title="导航">
        <Toggle
          label="显示 ◀ ▶ 按钮"
          checked={config.panel_show_nav}
          onChange={(v) => update({ panel_show_nav: v })}
        />
      </Section>

      <div className="pt-4">
        <p className="text-xs" style={{ color: "var(--main-text-dim)", opacity: 0.7 }}>
          所有设置自动保存，重启后保持。
        </p>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div
      className="border-t"
      style={{ borderColor: "var(--main-border)", opacity: 0.4 }}
    />
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--main-accent)", opacity: 0.8 }}>
      {children}
    </p>
  )
}

/* ---- 子组件 ---- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium mb-3" style={{ color: "var(--main-text)", opacity: 0.6 }}>
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between">
      <span className="text-sm" style={{ color: "var(--main-text-dim)" }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-blue-500" />
    </label>
  )
}

function Slider({ label, min, max, step, value, onChange }: {
  label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void
}) {
  return (
    <div>
      <label className="text-xs block mb-0.5" style={{ color: "var(--main-text-dim)" }}>{label}</label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  )
}

function ColorPicker({ label, value, onChange, onReset, active }: {
  label: string; value: string; onChange: (v: string) => void; onReset: () => void; active: boolean
}) {
  return (
    <div>
      <label className="text-xs block mb-1" style={{ color: "var(--main-text-dim)" }}>{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color" value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded border-0 cursor-pointer"
          style={{ background: "none", padding: 0 }}
        />
        <button
          onClick={onReset}
          className="text-xs px-2 py-1 rounded"
          style={{
            color: "var(--main-text-dim)",
            border: "1px solid var(--main-border)",
          }}
        >
          恢复默认
        </button>
        <span className="text-xs" style={{ color: "var(--main-text-dim)", opacity: 0.6 }}>
          {active ? value : "主题默认"}
        </span>
      </div>
    </div>
  )
}
