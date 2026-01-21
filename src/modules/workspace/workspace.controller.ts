import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateWorkspaceDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
} from './workspace.dto';
import { RequireWorkspaceRole } from '../../common/decorators/workspace-role.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

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

   @Get(':workspaceId/members')
  @RequireWorkspaceRole(
    WorkspaceMemberRole.ADMIN,
    WorkspaceMemberRole.MEMBER,
    WorkspaceMemberRole.GUEST, 
  )
  listMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.listMembers(+workspaceId);
  }

   
  @Post(':workspaceId/members/invite')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN)
  inviteMember(
    @Req() req: any,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspaceService.inviteMember(
      +workspaceId,
      req.user.id,
      dto,
    );
  }

   
  @Patch(':workspaceId/members/:userId/role')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN)
  updateMemberRole(
    @Req() req: any,
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.workspaceService.updateMemberRole(
      +workspaceId,
      +userId,
      req.user.id,
      dto,
    );
  }

  
}
