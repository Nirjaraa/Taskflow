import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateWorkspaceDto, InviteMemberDto, UpdateMemberRoleDto } from './workspace.dto';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.createWorkspace(req.user.id, dto);
  }

  @Get()
  list(@Req() req: any) {
    return this.workspaceService.listWorkspaces(req.user.id);
  }

  @Get(':id/members')
  listMembers(@Param('id') workspaceId: string) {
    return this.workspaceService.listMembers(+workspaceId);
  }

  @Post(':id/members/invite')
  inviteMember(@Req() req: any, @Param('id') workspaceId: string, @Body() dto: InviteMemberDto) {
    return this.workspaceService.inviteMember(+workspaceId, req.user.id, dto);
  }

  @Patch(':workspaceId/members/:userId/role')
  updateMemberRole(
    @Req() req: any,
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspaceService.updateMemberRole(+workspaceId, +userId, req.user.id, dto);
  }
}
