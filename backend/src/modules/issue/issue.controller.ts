import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IssueService } from './issue.service';
import { CreateIssueDto, UpdateIssueDto } from './issue-dto';
import { RequireWorkspaceRole } from '../../common/decorators/workspace-role.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@ApiTags('Issues')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  // GET /api/projects/:projectId/issues?assignee=me&sprint=active
  @Get('projects/:projectId/issues')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.MEMBER, WorkspaceMemberRole.GUEST)
  findAll(@Req() req: any, @Param('projectId') projectId: string, @Query() filters: any) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.issueService.findByProject(projectId, userId, filters);
  }

  // POST /api/issues?projectId=<uuid>
  @Post('issues')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.MEMBER)
  create(@Req() req: any, @Query('projectId') projectId: string, @Body() dto: CreateIssueDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.issueService.create(userId, projectId, dto);
  }

  // PATCH /api/issues/:issueId
  @Patch('issues/:issueId')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.MEMBER)
  update(@Req() req: any, @Param('issueId') issueId: string, @Body() dto: UpdateIssueDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.issueService.update(userId, Number(issueId), dto);
  }

  // DELETE /api/issues/:issueId
  @Delete('issues/:issueId')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.MEMBER)
  remove(@Req() req: any, @Param('issueId') issueId: string) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.issueService.remove(userId, Number(issueId));
  }

   @Get('issues/new')
  async listNewIssues(@Req() req: any) {
    const userId = req.user.id;
    return this.issueService.listNewIssues(userId);
  }
}
