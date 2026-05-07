import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './persistence/prisma.module';
import { AuthModule } from './auth.module';
import { ProjectModule } from './project.module';
import { TaskModule } from './task.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ProjectModule,
    TaskModule,
  ],
})
export class AppModule {}
