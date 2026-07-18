import { describe, it, expect } from 'vitest'
import { LICENSE_KEY_REGEX, isValidLicenseKey, normalizeLicenseKey } from './license-key'

describe('licensing — validação de chave', () => {
  it('LICENSE_KEY_REGEX casa com o formato XXXX-XXXX-XXXX', () => {
    expect(LICENSE_KEY_REGEX.test('ABCD-1234-WXYZ')).toBe(true)
    expect(LICENSE_KEY_REGEX.test('AAAA-BBBB-CCCC')).toBe(true)
  })

  it('LICENSE_KEY_REGEX rejeita formatos inválidos', () => {
    expect(LICENSE_KEY_REGEX.test('ABCD-1234-WXYZ-9999')).toBe(false) // extra
    expect(LICENSE_KEY_REGEX.test('ABCD-123-WXYZ')).toBe(false) // grupo curto
    expect(LICENSE_KEY_REGEX.test('abcd-1234-wxyz')).toBe(false) // minúsculas
    expect(LICENSE_KEY_REGEX.test('')).toBe(false)
  })

  it('normalizeLicenseKey faz trim e uppercase', () => {
    expect(normalizeLicenseKey('  abcd-1234-wxyz ')).toBe('ABCD-1234-WXYZ')
  })

  it('isValidLicenseKey valida e normaliza a entrada', () => {
    expect(isValidLicenseKey('abcd-1234-wxyz')).toBe(true)
    expect(isValidLicenseKey('  ABCD-1234-WXYZ ')).toBe(true)
    expect(isValidLicenseKey('1234-5678')).toBe(false)
    expect(isValidLicenseKey('ABCDEFGHIJKL')).toBe(false)
    expect(isValidLicenseKey('')).toBe(false)
  })
})
