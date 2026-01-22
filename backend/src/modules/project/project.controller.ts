import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateProjectDto, UpdateProjectDto } from './project-dto';
import { RequireWorkspaceRole } from '../../common/decorators/workspace-role.decorator';
import { WorkspaceMemberRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const key = uuidv4();  
@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}


  // ✅ List Projects (ALL roles)
  @Get('/workspace/:workspaceId')
  @RequireWorkspaceRole(
    WorkspaceMemberRole.ADMIN,
    WorkspaceMemberRole.MEMBER,
    WorkspaceMemberRole.GUEST,
  )
  findAll(
    @Req() req: any,
    @Param('workspaceId') workspaceId: number,
  ) {
    return this.projectService.findAll(req.user.id, workspaceId);
  }

  // ✅ Get Project
  @Get(':projectId')
  @RequireWorkspaceRole(
    WorkspaceMemberRole.ADMIN,
    WorkspaceMemberRole.MEMBER,
    WorkspaceMemberRole.GUEST,
  )
  findOne(
    @Req() req: any,
    @Param('projectId') projectId: string,
  ) {
    return this.projectService.findOne(req.user.id, projectId);
  }

  // ✅ Update Project (ADMIN, MEMBER)
  @Patch(':projectId')
  @RequireWorkspaceRole(
    WorkspaceMemberRole.ADMIN,
    WorkspaceMemberRole.MEMBER,
  )
  update(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectService.update(req.user.id, projectId, dto);
  }

  // ✅ Delete Project (ADMIN only)
  @Delete(':projectId')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN)
  remove(
    @Req() req: any,
    @Param('projectId') projectId: string,
  ) {
    return this.projectService.remove(req.user.id, projectId);
  }
}
