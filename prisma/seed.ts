import { PrismaClient, Role, UnitType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Admin user ────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@inoxcraft.com" },
    update: {},
    create: {
      name: "Hakeem Admin",
      email: "admin@inoxcraft.com",
      passwordHash,
      role: Role.admin,
    },
  });
  console.log("  ✓ Admin user:", admin.email);

  // ─── Materials catalogue ───────────────────────────────────────────────────
  const materials = [
    { name: "Stainless steel sheet 1.5mm", unitType: UnitType.kg, pricePerUnitKobo: 160_000 },
    { name: "Stainless steel sheet 2mm", unitType: UnitType.kg, pricePerUnitKobo: 180_000 },
    { name: "Stainless steel sheet 3mm", unitType: UnitType.kg, pricePerUnitKobo: 200_000 },
    { name: "Stainless steel rod 12mm", unitType: UnitType.metre, pricePerUnitKobo: 95_000 },
    { name: "Stainless steel rod 16mm", unitType: UnitType.metre, pricePerUnitKobo: 130_000 },
    { name: "Stainless steel rod 20mm", unitType: UnitType.metre, pricePerUnitKobo: 160_000 },
    { name: "Stainless steel pipe 25mm", unitType: UnitType.metre, pricePerUnitKobo: 220_000 },
    { name: "Stainless steel pipe 50mm", unitType: UnitType.metre, pricePerUnitKobo: 380_000 },
    { name: "Iron angle bar 50x50x5mm", unitType: UnitType.metre, pricePerUnitKobo: 55_000 },
    { name: "Iron flat bar 50x6mm", unitType: UnitType.metre, pricePerUnitKobo: 42_000 },
    { name: "Iron square bar 25x25mm", unitType: UnitType.metre, pricePerUnitKobo: 38_000 },
    { name: "Welding electrodes 3.2mm (kg)", unitType: UnitType.kg, pricePerUnitKobo: 70_000 },
    { name: "Primer paint red oxide", unitType: UnitType.piece, pricePerUnitKobo: 60_000 },
    { name: "Galvanised wire mesh (roll)", unitType: UnitType.piece, pricePerUnitKobo: 85_000 },
    { name: "Stainless steel hinge pair", unitType: UnitType.piece, pricePerUnitKobo: 45_000 },
    { name: "Gate lock (heavy duty)", unitType: UnitType.piece, pricePerUnitKobo: 120_000 },
  ];

  for (const mat of materials) {
    const existing = await prisma.material.findFirst({
      where: { name: mat.name, deletedAt: null },
    });
    if (existing) {
      await prisma.material.update({
        where: { id: existing.id },
        data: { pricePerUnitKobo: mat.pricePerUnitKobo, updatedById: admin.id },
      });
    } else {
      await prisma.material.create({ data: { ...mat, updatedById: admin.id } });
    }
  }
  console.log(`  ✓ ${materials.length} materials seeded`);

  // ─── Demo customer ─────────────────────────────────────────────────────────
  await prisma.customer.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Demo Customer",
      phone: "+2348000000000",
      email: "demo@example.com",
      address: "1 Demo Street, Lagos, Nigeria",
    },
  });
  console.log("  ✓ Demo customer seeded");

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
