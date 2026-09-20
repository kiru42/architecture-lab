import { Module } from '@nestjs/common';
import { CommentService } from '../core/application/services/comment.service';
import { CommentsController } from './web/controllers/comments.controller';
import { PrismaModule } from './persistence/prisma.module';
import { ProjectModule } from './project.module';

@Module({
  imports: [PrismaModule, ProjectModule],
  controllers: [CommentsController],
  providers: [CommentService],
})
export class CommentModule {}
