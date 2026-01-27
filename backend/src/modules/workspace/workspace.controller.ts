import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CreateWorkspaceDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
  DeleteWorkspaceDto
} from './workspace.dto';
import { RequireWorkspaceRole } from '../../common/decorators/workspace-role.decorator';
import { WorkspaceMemberRole } from '@prisma/client';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  // ✅ Create workspace → user becomes ADMIN automatically
  @Post()
  create(@Req() req: any, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.createWorkspace(req.user.id, dto);
  }

  // ✅ List workspaces of the user
  @Get()
  list(@Req() req: any) {
    
    
    return this.workspaceService.listWorkspaces(req.user.id);
    
    
  }

  // ✅ List members (any role can view)
  @Get(':workspaceId/members')
  @RequireWorkspaceRole(
    WorkspaceMemberRole.ADMIN,
    WorkspaceMemberRole.MEMBER,
    WorkspaceMemberRole.GUEST,
  )
  listMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspaceService.listMembers(+workspaceId);
  }

  // ✅ Invite member (only ADMIN)
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

  // ✅ Update member role (only ADMIN)
  @Patch(':workspaceId/members/:userId/role')
  @RequireWorkspaceRole(WorkspaceMemberRole.ADMIN)
  updateMemberRole(
    @Req() req: any,
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateMemberRoleDto,
    
  ) {
        console.log('Updater ID:', req.user.id);

    return this.workspaceService.updateMemberRole(
      +workspaceId,
      +userId,
      req.user.id,
      
      dto,
    );

  }

   @Delete(':id')
  async deleteWorkspace(
    @Param('id', ParseIntPipe) workspaceId: number,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.workspaceService.deleteWorkspace(workspaceId, userId);
  }
}

 

