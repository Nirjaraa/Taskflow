import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { PrismaService } from '../../prisma/prisma.service';  
@Module({
  providers: [PrismaService,CommentService],
  controllers: [CommentController], 
})
export class CommentModule {}
