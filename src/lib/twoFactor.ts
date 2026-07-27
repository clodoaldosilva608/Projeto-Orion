/**
 * 2FA (TOTP) helper.
 *
 * Uses otplib v13 functional API (generate / generateSecret / verify / generateURI).
 * The user's secret is stored as `two_factor_secret` on the `users` row.
 */
import { generateSecret, generate, generateSync, verify, verifySync, generateURI } from "otplib";

// otplib v13 defaults: 6 digits, 30-second period, SHA-1 — Google Authenticator compatible.

export function generateTwoFactorSecret(): string {
  return generateSecret({ length: 20 });
}

export async function totpToken(secret: string): Promise<string> {
  return generate({ secret });
}

export function totpTokenSync(secret: string): string {
  return generateSync({ secret });
}

export async function verifyTotp(token: string, secret: string): Promise<boolean> {
  try {
    const result = await verify({
      secret,
      token: token.replace(/\s+/g, ""),
      // Allow 1 step of drift (so users have up to ~60s to type the code).
      epochTolerance: 30,
    });
    return result.valid === true;
  } catch {
    return false;
  }
}

export function verifyTotpSync(token: string, secret: string): boolean {
  try {
    const result = verifySync({ secret, token: token.replace(/\s+/g, ""), epochTolerance: 30 });
    return result.valid === true;
  } catch {
    return false;
  }
}

/**
 * Build the otpauth:// URI used by QR-code generators.
 */
export function buildOtpAuthUri(params: {
  issuer: string;
  accountName: string;
  secret: string;
}): string {
  return generateURI({
    issuer: params.issuer,
    label: params.accountName,
    secret: params.secret,
    // defaults: totp, sha1, 6 digits, 30s period — matches Google Authenticator.
  });
}

/**
 * Generate a base64-encoded `data:image/png` QR code for the given URI.
 */
export async function generateQrCodeDataUrl(uri: string): Promise<string> {
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(uri, { margin: 1, width: 240, color: { dark: "#0f111a", light: "#ffffff" } });
}
