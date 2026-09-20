import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/** Shared infrastructure: one connection pool for every bounded context. */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
