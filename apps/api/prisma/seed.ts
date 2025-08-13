// apps/api/prisma/seed.ts
import { PrismaClient, EventStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1) Organiser (idempotent via unique slug)
  const org = await prisma.organiser.upsert({
    where: { slug: 'yorkshire-cc' },
    update: {},
    create: { name: 'Yorkshire CC', slug: 'yorkshire-cc' },
  });

  // 2) Events
  const today = new Date();
  const plus = (days: number) => new Date(today.getTime() + days * 86_400_000);

  await prisma.event.createMany({
    data: [
      {
        organiserId: org.id,
        name: 'Circuit Summer R4',
        venue: 'Brownlee Centre',
        date: plus(7),
        status: EventStatus.PUBLISHED,
      },
      {
        organiserId: org.id,
        name: 'Darley Moor GP',
        venue: 'Darley Moor',
        date: plus(21),
        status: EventStatus.PUBLISHED,
      },
      {
        organiserId: org.id,
        name: 'Last Week Race',
        venue: 'Town Loop',
        date: plus(-7),
        status: EventStatus.PUBLISHED,
      },
    ],
    // note: skipDuplicates only applies if you have a unique constraint on the row
    skipDuplicates: true,
  });

  // 3) Races for Circuit Summer R4 (idempotent using @@unique([eventId, name]) on Race)
  const event = await prisma.event.findFirst({
    where: { name: 'Circuit Summer R4' },
    select: { id: true },
  });
  if (!event) return;

  const ensureRace = async (data: {
    name: string;
    discipline: string;
    startTime?: string;
    laps?: number;
    capacity?: number;
  }) => {
    // if you added @@unique([eventId, name]) to Race, you can use upsert; otherwise emulate:
    const existing = await prisma.race.findFirst({
      where: { eventId: event.id, name: data.name },
      select: { id: true },
    });
    if (existing) return existing;
    return prisma.race.create({ data: { eventId: event.id, ...data } });
  };

  const r1 = await ensureRace({
    name: 'E/1/2/3',
    discipline: 'Crit',
    startTime: '10:00',
    laps: 45,
    capacity: 80,
  });

  const r2 = await ensureRace({
    name: 'Cat 3/4',
    discipline: 'Crit',
    startTime: '12:00',
    laps: 35,
    capacity: 90,
  });

  // 4) Categories (unique on [raceId, gender, label] makes this idempotent)
  await prisma.raceCategory.createMany({
    data: [
      { raceId: r1.id, gender: 'open', label: 'E' },
      { raceId: r1.id, gender: 'open', label: 'Cat 1' },
      { raceId: r1.id, gender: 'open', label: 'Cat 2' },
      { raceId: r1.id, gender: 'open', label: 'Cat 3' },
      { raceId: r2.id, gender: 'open', label: 'Cat 3' },
      { raceId: r2.id, gender: 'open', label: 'Cat 4' },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
