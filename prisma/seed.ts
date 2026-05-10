import { PrismaClient } from "@prisma/client"
import { fieldEncryptionExtension } from "prisma-field-encryption"

const prisma = new PrismaClient().$extends(
  fieldEncryptionExtension({
    encryptionKey: process.env.PRISMA_FIELD_ENCRYPTION_KEY!,
  })
)

async function main() {
  const hospitals = await Promise.all([
    prisma.hospital.upsert({
      where: { id: "hospital-1" },
      update: {},
      create: {
        id: "hospital-1",
        name: "National Hospital of Sri Lanka",
        location: "Colombo",
        isActive: true,
      },
    }),
    prisma.hospital.upsert({
      where: { id: "hospital-2" },
      update: {},
      create: {
        id: "hospital-2",
        name: "Karapitiya Teaching Hospital",
        location: "Galle",
        isActive: true,
      },
    }),
    prisma.hospital.upsert({
      where: { id: "hospital-3" },
      update: {},
      create: {
        id: "hospital-3",
        name: "Teaching Hospital Kandy",
        location: "Kandy",
        isActive: true,
      },
    }),
  ])

  const mealTimes = await Promise.all([
    prisma.mealTime.upsert({
      where: { id: "mealtime-breakfast" },
      update: {},
      create: { id: "mealtime-breakfast", name: "Breakfast", timeString: "07:00", isActive: true },
    }),
    prisma.mealTime.upsert({
      where: { id: "mealtime-lunch" },
      update: {},
      create: { id: "mealtime-lunch", name: "Lunch", timeString: "12:00", isActive: true },
    }),
    prisma.mealTime.upsert({
      where: { id: "mealtime-dinner" },
      update: {},
      create: { id: "mealtime-dinner", name: "Dinner", timeString: "18:00", isActive: true },
    }),
  ])

  const adminSub = process.env.SEED_ADMIN_SUB
  if (adminSub) {
    await prisma.user.upsert({
      where: { id: adminSub },
      update: { role: "ADMIN" },
      create: { id: adminSub, name: "Admin User", email: "admin@volunteersl.org", role: "ADMIN" },
    })
    console.log(`Admin user seeded: ${adminSub}`)
  }

  console.log(`Seeded ${hospitals.length} hospitals and ${mealTimes.length} meal times`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
