import { PrismaClient } from "@prisma/client"
import { fieldEncryptionExtension } from "prisma-field-encryption"
import bcrypt from "bcryptjs"

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
      create: { id: "hospital-1", name: "National Hospital of Sri Lanka", location: "Colombo", isActive: true },
    }),
    prisma.hospital.upsert({
      where: { id: "hospital-2" },
      update: {},
      create: { id: "hospital-2", name: "Karapitiya Teaching Hospital", location: "Galle", isActive: true },
    }),
    prisma.hospital.upsert({
      where: { id: "hospital-3" },
      update: {},
      create: { id: "hospital-3", name: "Teaching Hospital Kandy", location: "Kandy", isActive: true },
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

  const adminHash = await bcrypt.hash("admin123", 12)
  await prisma.user.upsert({
    where: { email: "admin@volunteersl.org" },
    update: { password: adminHash, role: "ADMIN" },
    create: {
      name: "Admin User",
      email: "admin@volunteersl.org",
      password: adminHash,
      role: "ADMIN",
    },
  })

  const donorHash = await bcrypt.hash("donor123", 12)
  await prisma.user.upsert({
    where: { email: "donor@example.com" },
    update: { password: donorHash },
    create: {
      name: "Test Donor",
      email: "donor@example.com",
      password: donorHash,
      role: "DONOR",
    },
  })

  console.log(`Seeded ${hospitals.length} hospitals and ${mealTimes.length} meal times`)
  console.log("Admin:  admin@volunteersl.org / admin123")
  console.log("Donor:  donor@example.com / donor123")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
