"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const org = await prisma.organiser.upsert({
        where: { slug: 'yorkshire-cc' },
        update: {},
        create: { name: 'Yorkshire CC', slug: 'yorkshire-cc' },
    });
    const today = new Date();
    const plus = (days) => new Date(today.getTime() + days * 86_400_000);
    await prisma.event.createMany({
        data: [
            {
                organiserId: org.id,
                name: 'Circuit Summer R4',
                venue: 'Brownlee Centre',
                date: plus(7),
                status: client_1.EventStatus.PUBLISHED,
            },
            {
                organiserId: org.id,
                name: 'Darley Moor GP',
                venue: 'Darley Moor',
                date: plus(21),
                status: client_1.EventStatus.PUBLISHED,
            },
            {
                organiserId: org.id,
                name: 'Last Week Race',
                venue: 'Town Loop',
                date: plus(-7),
                status: client_1.EventStatus.PUBLISHED,
            },
        ],
        skipDuplicates: true,
    });
    const event = await prisma.event.findFirst({
        where: { name: 'Circuit Summer R4' },
        select: { id: true },
    });
    if (!event)
        return;
    const ensureRace = async (data) => {
        const existing = await prisma.race.findFirst({
            where: { eventId: event.id, name: data.name },
            select: { id: true },
        });
        if (existing)
            return existing;
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
//# sourceMappingURL=seed.js.map