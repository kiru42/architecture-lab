import { Module } from '@nestjs/common';
import { CommentsRepository } from './comments.repository';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';

@Module({
  controllers: [CommentsController],
  providers: [CommentsRepository, CommentsService],
})
export class CommentsModule {}
