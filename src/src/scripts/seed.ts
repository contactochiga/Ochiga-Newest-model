// src/scripts/seed.ts
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { getRefreshExpiresAt, hashToken } from "../utils/jwt";

async function main() {
  const pw = "AdminPass123!";
  const hash = await bcrypt.hash(pw, 10);

  const manager = await prisma.user.upsert({
    where: { email: "manager@ochiga.test" },
    update: {},
    create: {
      email: "manager@ochiga.test",
      passwordHash: hash,
      fullName: "Manager John",
      role: "manager",
      phone: "+2348000000000",
    },
  });

  const estate = await prisma.estate.upsert({
    where: { name: "Ochiga Estate" },
    update: {},
    create: {
      name: "Ochiga Estate",
      address: "Parklane, Lagos, Nigeria",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
    },
  });

  const housesData = [
    { number: "A1", ownerId: null },
    { number: "A2", ownerId: null },
    { number: "B1", ownerId: manager.id }, // manager owns B1 for demo
  ];

  for (const h of housesData) {
    await prisma.house.upsert({
      where: { id: `${estate.id}-${h.number}` }, // just a deterministic key hack - not ideal
      update: {},
      create: {
        estateId: estate.id,
        number: h.number,
        ownerId: h.ownerId,
        status: "vacant",
        balance: 0,
      },
    });
  }

  console.log("Seed complete. manager login:", "manager@ochiga.test", pw);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
