import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { Race, RaceCategory, Event } from '@prisma/client';

type RaceDTO = {
  id: string;
  name: string;
  discipline: string;
  startTime?: string | null;
  laps?: number | null;
  capacity?: number | null;
  categories: { open: string[]; women: string[] };
};

type EventDTO = Event & { /* already typed by Prisma when included */ };


@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  // GET /v1/events/upcoming
  @Get('events/upcoming')
  async upcoming() {
    const now = new Date();
    return this.prisma.event.findMany({
      where: { date: { gte: now }, status: 'PUBLISHED' },
      orderBy: { date: 'asc' },
      include: { organiser: true },
    });
  }

  // GET /v1/events/:id  — event details (+ optionally its races)
  @Get('events/:id')
  async eventById(@Param('id') id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        organiser: true,
        //if you want races here, uncomment this block:
        races: {
          orderBy: { startTime: 'asc' },
          include: { categories: true },
        },
      },
    });
  }

  // GET /v1/events/:id/races  — races for an event (with categories grouped)
  @Get('events/:id/races')
  async racesForEvent(@Param('id') id: string): Promise<RaceDTO[]> {
    // ✅ Explicit type to satisfy eslint
    const races: (Race & { categories: RaceCategory[] })[] =
      await this.prisma.race.findMany({
        where: { eventId: id },
        orderBy: { startTime: 'asc' },
        include: { categories: true },
      });

    const result: RaceDTO[] = races.map((r) => ({
      id: r.id,
      name: r.name,
      discipline: r.discipline,
      startTime: r.startTime,
      laps: r.laps ?? undefined,
      capacity: r.capacity ?? undefined,
      categories: {
        open: r.categories.filter((c) => c.gender === 'open').map((c) => c.label),
        women: r.categories.filter((c) => c.gender === 'women').map((c) => c.label),
      },
    }));

    return result;
  }
}
