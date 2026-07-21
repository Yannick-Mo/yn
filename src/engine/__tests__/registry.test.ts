import { describe, it, expect } from "vitest"
import { SourceRegistry } from "../registry"

describe("SourceRegistry", () => {
  it("starts with local adapter enabled and 5 network adapters disabled", () => {
    const reg = new SourceRegistry()
    expect(reg.getEnabled().length).toBe(1)
    const first = reg.getEnabled()[0]
    expect(first).toBeDefined()
    expect(first!.name).toBe("local")
    expect(reg.getAll().length).toBe(6)
  })

  it("returns a sentence from fetchSentence using local adapter", async () => {
    const reg = new SourceRegistry()
    const result = await reg.fetchSentence()
    expect(result.sentence).toBeDefined()
    expect(result.sentence?.content).toBeTruthy()
    expect(result.sentence?.source).toBe("local")
  })

  it("returns error when no sources enabled", async () => {
    const reg = new SourceRegistry()
    const local = reg.get("local")
    expect(local).toBeDefined()
    local!.config.enabled = false
    const result = await reg.fetchSentence()
    expect(result.error).toBe("没有启用的来源")
  })

  it("selectAdapter returns null when no sources enabled", () => {
    const reg = new SourceRegistry()
    const local = reg.get("local")
    expect(local).toBeDefined()
    local!.config.enabled = false
    expect(reg.selectAdapter()).toBeNull()
  })

  it("selectAdapter returns an enabled adapter for random strategy", () => {
    const reg = new SourceRegistry()
    const adapter = reg.selectAdapter()
    expect(adapter).not.toBeNull()
    expect(adapter!.config.enabled).toBe(true)
  })

  it("selectAdapter cycles through adapters with round-robin", () => {
    const reg = new SourceRegistry()
    reg.setStrategy("round-robin")
    const adapter1 = reg.selectAdapter()
    expect(adapter1).not.toBeNull()
    const adapter2 = reg.selectAdapter()
    expect(adapter2).not.toBeNull()
  })

  it("selectAdapter returns first enabled for single strategy", () => {
    const reg = new SourceRegistry()
    reg.setStrategy("single")
    const first = reg.selectAdapter()
    expect(first).not.toBeNull()
    expect(first!.name).toBe("local")
  })

  it("get returns undefined for unknown adapter", () => {
    const reg = new SourceRegistry()
    expect(reg.get("nonexistent")).toBeUndefined()
  })

  describe("strategy edge cases", () => {
    it("creates a registry with only network adapters", () => {
      const reg = new SourceRegistry()
      const local = reg.get("local")
      expect(local).toBeDefined()
      local!.config.enabled = false
      const network = reg.get("hitokoto")
      expect(network).toBeDefined()
      network!.config.enabled = true
      expect(reg.getEnabled().length).toBe(1)
      expect(reg.getEnabled()[0]!.name).toBe("hitokoto")
    })
  })
})
