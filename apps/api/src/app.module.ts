import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AppController } from './app.controller';
import { EntriesController } from './entries.controller';

@Module({
  controllers: [AppController, EntriesController],
  providers: [PrismaService],
})
export class AppModule {}
