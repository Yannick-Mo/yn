import { describe, it, expect } from "vitest"
import { SourceRegistry } from "../registry"

describe("SourceRegistry", () => {
  it("starts with local adapter enabled and 4 network adapters disabled", () => {
    const reg = new SourceRegistry()
    expect(reg.getEnabled().length).toBe(1)
    expect(reg.getEnabled()[0].name).toBe("local")
    expect(reg.getAll().length).toBe(5)
  })

  it("returns a sentence from fetchSentence", async () => {
    const reg = new SourceRegistry()
    const result = await reg.fetchSentence()
    expect(result.sentence).toBeDefined()
    expect(result.sentence?.content).toBeTruthy()
    expect(result.sentence?.source).toBe("local")
  })

  it("returns error when no sources enabled", async () => {
    const reg = new SourceRegistry()
    reg.get("local")!.config.enabled = false
    const result = await reg.fetchSentence()
    expect(result.error).toBe("No enabled sources")
  })
})
