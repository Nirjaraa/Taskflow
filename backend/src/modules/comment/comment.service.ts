import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './comment-dto';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async findByIssue(issueId: number, userId: number) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found');

    // Check workspace membership
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: issue.workspaceId, userId } },
    });
    if (!member) throw new UnauthorizedException('You cannot view comments for this issue');

    return this.prisma.comment.findMany({
      where: { issueId },
      orderBy: { createdAt: 'asc' },
      include: { user: true }, 
    });
  }

  async create(userId: number, dto: CreateCommentDto) {
  // convert dto.issueId to number
  const issueId = Number(dto.issueId);
  if (isNaN(issueId)) throw new Error('Invalid issueId');

  const issue = await this.prisma.issue.findUnique({
    where: { id: issueId },
  });
  if (!issue) throw new NotFoundException('Issue not found');

  const member = await this.prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: issue.workspaceId, userId } },
  });
  if (!member) throw new UnauthorizedException('You cannot comment on this issue');

  return this.prisma.comment.create({
    data: {
      content: dto.content,
      issueId: issueId,
      userId,
    },
  });
}


  async update(userId: number, commentId: number, dto: UpdateCommentDto) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.userId !== userId) {
      throw new UnauthorizedException('You can only update your own comments');
    }

    return this.prisma.comment.update({ where: { id: commentId }, data: dto });
  }

  async remove(userId: number, commentId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    // Allow delete if admin of workspace or owner of comment
    const issue = await this.prisma.issue.findUnique({ where: { id: comment.issueId } });
    if (!issue) throw new NotFoundException('Issue not found');
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: issue.workspaceId, userId } },
    });
    const isAdmin = member?.role === 'ADMIN';
    if (!isAdmin && comment.userId !== userId) {
      throw new UnauthorizedException('You cannot delete this comment');
    }

    return this.prisma.comment.delete({ where: { id: commentId } });
  }
}
