import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './comment-dto';
import { RequireWorkspaceRole } from '../../common/decorators/workspace-role.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // ✅ Get all comments for an issue
  @Get('issue/:issueId')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.MEMBER, WorkspaceMemberRole.GUEST)
  findByIssue(@Req() req: any, @Param('issueId') issueId: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.commentService.findByIssue(Number(issueId), userId);
  }

  // ✅ Create comment
  @Post()
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.MEMBER)
  create(@Req() req: any, @Body() dto: CreateCommentDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.commentService.create(userId, dto);
  }

  // ✅ Update comment
  @Patch(':commentId')
  update(@Req() req: any, @Param('commentId') commentId: string, @Body() dto: UpdateCommentDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.commentService.update(userId, Number(commentId), dto);
  }

  // ✅ Delete comment
  @Delete(':commentId')
  remove(@Req() req: any, @Param('commentId') commentId: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.commentService.remove(userId, Number(commentId));
  }

   @Get('new')
  async getNewComments(@Req() req: any) {
    const userId = req.user.sub; // from JWT payload
    return this.commentService.listNewComments(userId);
  }
}
