/**
 * P18 — SaaS Multi-Tenant Seed
 *
 * Ensures:
 * 1. Orion is the default tenant (id=1) with subdomain, colors, logo
 * 2. Admin user has isSuperAdmin=true
 * 3. Orion has an Enterprise license
 *
 * Run: bunx tsx prisma/seed-saas.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log("🌱 Seeding SaaS Multi-Tenant data...\n");

  // 1. Find or create Orion company (tenant id=1)
  let company = await prisma.company.findFirst({
    where: { id: 1n },
  });

  if (!company) {
    // Try by trade name
    company = await prisma.company.findFirst({
      where: { tradeName: { contains: "Orion", mode: "insensitive" } },
    });
  }

  if (company) {
    // Update existing company with SaaS fields
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        subdomain: "paguemenos",
        primaryColor: "#DC2626", // Orion red
        secondaryColor: "#EF4444",
        backgroundColor: "#0f111a",
        appName: "Orion",
        plan: "enterprise",
        active: true,
      },
    });
    console.log(`✓ Updated company: ${company.tradeName} (id=${company.id})`);
    console.log(`  subdomain: ${company.subdomain}`);
    console.log(`  appName: ${company.appName}`);
    console.log(`  colors: ${company.primaryColor} / ${company.secondaryColor}`);
  } else {
    // Create Orion as first tenant
    company = await prisma.company.create({
      data: {
        tradeName: "Orion",
        legalName: "Orion Platform LTDA",
        subdomain: "paguemenos",
        primaryColor: "#DC2626",
        secondaryColor: "#EF4444",
        backgroundColor: "#0f111a",
        appName: "Orion",
        plan: "enterprise",
        active: true,
        country: "BR",
      },
    });
    console.log(`✓ Created company: ${company.tradeName} (id=${company.id})`);
  }

  // 2. Create or update Enterprise license for Orion
  let license = await prisma.license.findFirst({
    where: { companies: { some: { id: company.id } } },
  });

  if (!license) {
    license = await prisma.license.create({
      data: {
        plan: "enterprise",
        status: "active",
        maxUsers: 100,
        maxBranches: 20,
        maxIndicators: 50,
        startDate: new Date(),
        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        active: true,
      },
    });
    console.log(`✓ Created Enterprise license (id=${license.id})`);
  } else {
    license = await prisma.license.update({
      where: { id: license.id },
      data: { plan: "enterprise", status: "active", maxUsers: 100, maxBranches: 20, active: true },
    });
    console.log(`✓ Updated license to Enterprise (id=${license.id})`);
  }

  // Link license to company if not linked
  if (!company.licenseId) {
    await prisma.company.update({
      where: { id: company.id },
      data: {
        licenseId: license.id,
        licenseExpiresAt: license.expirationDate,
      },
    });
    console.log(`✓ Linked license to company`);
  }

  // 3. Mark admin user as Super Admin
  const adminEmail = "clodoaldosilva608@gmail.com";
  let adminUser = await prisma.user.findFirst({
    where: { email: { equals: adminEmail, mode: "insensitive" } },
  });

  if (adminUser) {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        isSuperAdmin: true,
        status: "active",
        companyId: company.id,
      },
    });
    console.log(`✓ Marked ${adminUser.email} as Super Admin (id=${adminUser.id})`);
  } else {
    console.log(`⚠ Admin user ${adminEmail} not found — create it via Supabase Auth first`);
  }

  console.log("\n✅ SaaS Multi-Tenant seed completed!");
  console.log(`   Tenant: ${company.tradeName} (subdomain: ${company.subdomain})`);
  console.log(`   Plan: Enterprise (max ${license.maxUsers} users, ${license.maxBranches} branches)`);
  console.log(`   Super Admin: ${adminUser?.email ?? "not found"}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
