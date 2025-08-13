import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';

type CreateEntryDto = {
  riderName: string;
  email?: string;
  club?: string;
  bcId?: string;
  emergencyName: string;
  emergencyPhone: string;
};

@Controller()
export class EntriesController {
  constructor(private prisma: PrismaService) {}

  // GET /v1/races/:raceId/availability
  @Get('races/:raceId/availability')
  async availability(@Param('raceId') raceId: string) {
    const race = await this.prisma.race.findUnique({
      where: { id: raceId },
      select: { id: true, capacity: true },
    });
    if (!race) throw new NotFoundException('Race not found');
    const count = await this.prisma.entry.count({ where: { raceId } });
    const remaining =
      typeof race.capacity === 'number'
        ? Math.max(0, race.capacity - count)
        : null;
    return { capacity: race.capacity ?? null, taken: count, remaining };
  }

  // POST /v1/races/:raceId/entries
  @Post('races/:raceId/entries')
  async createEntry(
    @Param('raceId') raceId: string,
    @Body() body: CreateEntryDto,
  ) {
    const race = await this.prisma.race.findUnique({
      where: { id: raceId },
      include: { event: { select: { id: true, name: true, date: true } } }
    });
    if (!race) throw new NotFoundException('Race not found');

    // Capacity check
    if (typeof race.capacity === 'number') {
      const count = await this.prisma.entry.count({ where: { raceId } });
      if (count >= race.capacity) throw new BadRequestException('Race is full');
    }

    // Basic validations
    if (!body.riderName?.trim()) throw new BadRequestException('riderName required');
    if (!body.emergencyName?.trim() || !body.emergencyPhone?.trim())
      throw new BadRequestException('Emergency contact required');

    const entry = await this.prisma.entry.create({
      data: {
        raceId,
        riderName: body.riderName.trim(),
        email: body.email?.trim(),
        club: body.club?.trim(),
        bcId: body.bcId?.trim(),
        emergencyName: body.emergencyName.trim(),
        emergencyPhone: body.emergencyPhone.trim(),
        paid: false,
      },
    });

    // Return an order reference (for Stripe later). For dev we just echo entry id.
    return {
      entryId: entry.id,
      race: { id: race.id, name: race.name },
      event: race.event,
      payment: { provider: 'sim', clientSecret: entry.id }
    };
  }

  // POST /v1/payments/simulate  { entryId }
  @Post('payments/simulate')
  async simulatePayment(@Body() body: { entryId: string }) {
    if (!body.entryId) throw new BadRequestException('entryId required');
    const entry = await this.prisma.entry.findUnique({
      where: { id: body.entryId },
      select: { id: true, paid: true },
    });
    if (!entry) throw new NotFoundException('Entry not found');
    if (entry.paid) return { status: 'already_paid' };
    await this.prisma.entry.update({
      where: { id: body.entryId },
      data: { paid: true },
    });
    return { status: 'paid' };
  }
}
