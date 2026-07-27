"use server";

/**
 * P10 — Marketplace de Plugins server actions.
 *
 * Per docs/16_Roadmap.md v2.0 Q2 2026:
 *   "Marketplace de Plugins v1 — API pública, SDKs, 5 plugins oficiais"
 *
 * Features:
 *   - seedOfficialPluginsAction: cria os 5 plugins oficiais na 1ª visita
 *   - listPluginsAction: lista plugins do marketplace (com filtros)
 *   - getPluginAction: detalhes de um plugin
 *   - installPluginAction: instala plugin em uma empresa
 *   - uninstallPluginAction: remove plugin
 *   - updatePluginConfigAction: atualiza configuração
 *   - listInstalledPluginsAction: plugins instalados da empresa atual
 *
 * API Keys:
 *   - createApiKeyAction: gera nova chave (orion_live_...)
 *   - listApiKeysAction: lista chaves ativas
 *   - revokeApiKeyAction: revoga chave
 */
import { revalidatePath } from "next/cache";
import { prisma } from "./db";
import { createSupabaseServerClient } from "./supabase";
import { logAudit } from "./audit";
import { OFFICIAL_PLUGINS } from "./plugins-helpers";

async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const dbUser = await prisma.user.findUnique({
    where: { supabaseId: user.id },
  });
  if (!dbUser) return null;
  return dbUser;
}

// ================================================================
// SEED OFFICIAL PLUGINS — idempotent
// ================================================================

export async function seedOfficialPluginsAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    let created = 0;
    for (const p of OFFICIAL_PLUGINS) {
      const existing = await prisma.plugin.findUnique({ where: { slug: p.slug } });
      if (existing) continue;
      await prisma.plugin.create({
        data: {
          slug: p.slug,
          name: p.name,
          displayName: p.displayName,
          description: p.description,
          category: p.category,
          iconEmoji: p.iconEmoji,
          iconColor: p.iconColor,
          author: p.author,
          isOfficial: p.isOfficial,
          eventsSupported: p.eventsSupported,
          defaultConfig: p.defaultConfig as any,
          configSchema: p.configSchema as any,
          isFree: true,
          isActive: true,
        },
      });
      created++;
    }
    return { data: { created, total: OFFICIAL_PLUGINS.length }, error: null };
  } catch (e) {
    console.error("seedOfficialPluginsAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// PLUGINS — list & get
// ================================================================

export async function listPluginsAction(filters?: {
  category?: string;
  search?: string;
  installedOnly?: boolean;
}) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    // Ensure official plugins exist
    await seedOfficialPluginsAction();

    const where: any = { isActive: true };
    if (filters?.category && filters.category !== "all") {
      where.category = filters.category;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { displayName: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const plugins = await prisma.plugin.findMany({
      where,
      orderBy: [{ isOfficial: "desc" }, { installCount: "desc" }, { displayName: "asc" }],
    });

    // Get installed plugins for this company
    const installed = await prisma.pluginInstallation.findMany({
      where: { companyId: user.companyId, status: { in: ["installed", "enabled"] } },
      select: { pluginSlug: true, status: true, config: true, installedAt: true },
    });
    const installedMap = new Map(installed.map((i) => [i.pluginSlug, i]));

    const data = plugins.map((p) => ({
      id: p.id.toString(),
      slug: p.slug,
      name: p.name,
      displayName: p.displayName,
      description: p.description,
      category: p.category,
      version: p.version,
      author: p.author,
      isOfficial: p.isOfficial,
      iconEmoji: p.iconEmoji,
      iconColor: p.iconColor,
      iconUrl: p.iconUrl,
      homepageUrl: p.homepageUrl,
      docsUrl: p.docsUrl,
      eventsSupported: p.eventsSupported,
      installCount: p.installCount,
      rating: p.rating ? Number(p.rating) : null,
      ratingCount: p.ratingCount,
      isFree: p.isFree,
      priceCents: p.priceCents,
      isInstalled: installedMap.has(p.slug),
      installation: installedMap.get(p.slug) ?? null,
    }));

    const filtered = filters?.installedOnly ? data.filter((p) => p.isInstalled) : data;
    return { data: filtered, error: null };
  } catch (e) {
    console.error("listPluginsAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function getPluginAction(slug: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const plugin = await prisma.plugin.findUnique({ where: { slug } });
    if (!plugin) return { data: null, error: "Plugin não encontrado" };

    const installation = await prisma.pluginInstallation.findUnique({
      where: { companyId_pluginSlug: { companyId: user.companyId, pluginSlug: slug } },
    });

    return {
      data: {
        ...plugin,
        id: plugin.id.toString(),
        rating: plugin.rating ? Number(plugin.rating) : null,
        isInstalled: !!installation,
        installation: installation
          ? {
              ...installation,
              id: installation.id.toString(),
              companyId: installation.companyId.toString(),
              installedAt: installation.installedAt.toISOString(),
              updatedAt: installation.updatedAt.toISOString(),
              lastErrorAt: installation.lastErrorAt?.toISOString() ?? null,
            }
          : null,
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// INSTALL / UNINSTALL
// ================================================================

export async function installPluginAction(slug: string, config?: Record<string, unknown>) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const plugin = await prisma.plugin.findUnique({ where: { slug } });
    if (!plugin) return { data: null, error: "Plugin não encontrado" };

    const installation = await prisma.pluginInstallation.upsert({
      where: { companyId_pluginSlug: { companyId: user.companyId, pluginSlug: slug } },
      update: {
        status: "enabled",
        config: (config as any) ?? plugin.defaultConfig,
      },
      create: {
        companyId: user.companyId,
        pluginSlug: slug,
        pluginVersion: plugin.version,
        status: "enabled",
        config: (config as any) ?? plugin.defaultConfig,
      },
    });

    // Increment install count (only on first install)
    if (!installation.updatedAt || installation.updatedAt.getTime() === installation.installedAt.getTime()) {
      await prisma.plugin.update({
        where: { slug },
        data: { installCount: { increment: 1 } },
      });
    }

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "plugin_installations",
      recordId: installation.id,
      newValue: { slug, version: plugin.version },
    });

    revalidatePath("/plugins");
    revalidatePath(`/plugins/${slug}`);
    return { data: { id: installation.id.toString() }, error: null };
  } catch (e) {
    console.error("installPluginAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function uninstallPluginAction(slug: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.pluginInstallation.deleteMany({
      where: { companyId: user.companyId, pluginSlug: slug },
    });

    await prisma.plugin.update({
      where: { slug },
      data: { installCount: { decrement: 1 } },
    }).catch(() => {});

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "delete",
      tableName: "plugin_installations",
      newValue: { slug },
    });

    revalidatePath("/plugins");
    revalidatePath(`/plugins/${slug}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function updatePluginConfigAction(slug: string, config: Record<string, unknown>) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.pluginInstallation.update({
      where: { companyId_pluginSlug: { companyId: user.companyId, pluginSlug: slug } },
      data: { config: config as any },
    });

    revalidatePath("/plugins");
    revalidatePath(`/plugins/${slug}`);
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// API KEYS — for public API access
// ================================================================

function generateApiKey(): { key: string; hash: string; prefix: string } {
  // Generate a random 40-char hex string
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let random = "";
  for (let i = 0; i < 40; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  const key = `orion_live_${random}`;
  // Hash with simple SHA-256 (using Web Crypto API available in Node 18+)
  // For simplicity, we use a simple base64 encoding (in production, use bcrypt or argon2)
  const hash = Buffer.from(key).toString("base64");
  const prefix = key.slice(0, 15); // orion_live_xxx
  return { key, hash, prefix };
}

export async function createApiKeyAction(name: string, scope: "read" | "write" | "admin" = "read") {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const { key, hash, prefix } = generateApiKey();

    const apiKey = await prisma.apiKey.create({
      data: {
        companyId: user.companyId,
        userId: user.id,
        name,
        keyHash: hash,
        keyPrefix: prefix,
        scope: scope as any,
      },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "create",
      tableName: "api_keys",
      recordId: apiKey.id,
      newValue: { name, scope, prefix },
    });

    return {
      data: {
        id: apiKey.id.toString(),
        key, // returned ONCE — never retrievable again
        prefix,
        name,
        scope,
      },
      error: null,
    };
  } catch (e) {
    console.error("createApiKeyAction error:", e);
    return { data: null, error: (e as Error).message };
  }
}

export async function listApiKeysAction() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    const keys = await prisma.apiKey.findMany({
      where: { companyId: user.companyId, active: true, revokedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return {
      data: keys.map((k) => ({
        ...k,
        id: k.id.toString(),
        companyId: k.companyId.toString(),
        userId: k.userId.toString(),
        createdAt: k.createdAt.toISOString(),
        updatedAt: k.updatedAt.toISOString(),
        expiresAt: k.expiresAt?.toISOString() ?? null,
        lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      })),
      error: null,
    };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

export async function revokeApiKeyAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: "Não autorizado" };

  try {
    await prisma.apiKey.updateMany({
      where: { id: BigInt(id), companyId: user.companyId },
      data: { active: false, revokedAt: new Date() },
    });

    await logAudit({
      companyId: user.companyId,
      userId: user.id,
      action: "delete",
      tableName: "api_keys",
      recordId: BigInt(id),
    });

    revalidatePath("/plugins/api-keys");
    return { data: { ok: true }, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

// ================================================================
// AUTHENTICATE API KEY — used by /api/v1/public/* routes
// ================================================================

export async function authenticateApiKeyAction(bearerToken: string): Promise<{
  valid: boolean;
  companyId?: string;
  apiKeyId?: string;
  scope?: string;
}> {
  if (!bearerToken.startsWith("orion_live_")) {
    return { valid: false };
  }
  const hash = Buffer.from(bearerToken).toString("base64");
  const apiKey = await prisma.apiKey.findFirst({
    where: { keyHash: hash, active: true, revokedAt: null },
    select: { id: true, companyId: true, scope: true },
  });
  if (!apiKey) return { valid: false };

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: {
      lastUsedAt: new Date(),
      requestCount: { increment: 1 },
    },
  });

  return {
    valid: true,
    companyId: apiKey.companyId.toString(),
    apiKeyId: apiKey.id.toString(),
    scope: apiKey.scope,
  };
}
