import { describe, it, expect, vi, afterEach } from 'vitest'

describe('ai-client — aiEnabled', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('aiEnabled é false quando OPENAI_API_KEY não está definida', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')
    const { aiEnabled } = await import('@/modules/ai/lib/ai-client')
    expect(aiEnabled).toBe(false)
  })

  it('aiEnabled é true quando OPENAI_API_KEY está definida', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test-123')
    const { aiEnabled } = await import('@/modules/ai/lib/ai-client')
    expect(aiEnabled).toBe(true)
  })

  it('askAI retorna fallback amigável quando a IA não está habilitada', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')
    const { askAI } = await import('@/modules/ai/lib/ai-client')
    const res = await askAI('system', 'pergunta')
    expect(res.usedFallback).toBe(true)
    expect(res.text.length).toBeGreaterThan(0)
  })
})
