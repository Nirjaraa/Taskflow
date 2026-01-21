import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { SprintService } from './sprint.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateSprintDto, UpdateSprintDto } from './sprint-dto';
import { RequireWorkspaceRole } from '../../common/decorators/workspace-role.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@ApiTags('Sprints')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api')
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  // GET all sprints of a project (any workspace member/guest)
  @Get('projects/:projectId/sprints')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN, WorkspaceMemberRole.MEMBER, WorkspaceMemberRole.GUEST)
  findAll(@Req() req: any, @Param('projectId') projectId: string) {
    return this.sprintService.findByProject(req.user.id, projectId);
  }

  // POST create sprint (Admin only)
  @Post('projects/:projectId/sprints')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN)
  create(@Req() req: any, @Param('projectId') projectId: string, @Body() dto: CreateSprintDto) {
    return this.sprintService.create(req.user.id, projectId, dto);
  }

  // PATCH update sprint (Admin only)
  @Patch('sprints/:sprintId')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN)
  update(@Req() req: any, @Param('sprintId') sprintId: string, @Body() dto: UpdateSprintDto) {
    return this.sprintService.update(req.user.id, Number(sprintId), dto);
  }
}
