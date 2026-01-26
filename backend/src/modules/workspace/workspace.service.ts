import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto, InviteMemberDto, UpdateMemberRoleDto } from './workspace.dto';
import { WorkspaceMemberRole,InviteStatus } from '@prisma/client';
 
@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async createWorkspace(ownerId: number, dto: CreateWorkspaceDto) {
  const workspace = await this.prisma.workspace.create({
    data: {
      name: dto.name,
      urlSlug: dto.urlSlug,
      ownerId,
      members: {
        create: [{ userId: ownerId,  role: WorkspaceMemberRole.ADMIN,   status: InviteStatus.ACCEPTED,}], 
      },
    },
  });
  return workspace;
}

  async listWorkspaces(userId: number) {
  const workspaces = await this.prisma.workspace.findMany({
    
    where: { members: { some: { userId } } },
    include: { members: true }, // include all members
    
  });

  // Attach current user's role to workspace
  return workspaces.map(ws => {
    const me = ws.members.find(m => m.userId === userId);
    return {
      ...ws,
      role: me?.role || 'MEMBER', // now frontend can read ws.role
    };
  });
}

 async inviteMember(
  workspaceId: number,
  inviterId: number,
  dto: InviteMemberDto,
) {
  // 1️⃣ Ensure inviter is ADMIN
  const inviter = await this.prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: inviterId,
      },
    },
  });

  if (!inviter || inviter.role !== WorkspaceMemberRole.ADMIN) {
    throw new ForbiddenException('Only admins can invite members');
  }

  // 2️⃣ Find user by email
  const user = await this.prisma.user.findUnique({
    where: { email: dto.email },
  });

  if (!user) {
    throw new NotFoundException('User with this email does not exist');
  }

  // 3️⃣ Prevent duplicate membership
  const existingMember = await this.prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: user.id,
      },
    },
  });

  if (existingMember) {
    throw new ForbiddenException(
      'User is already a member of this workspace',
    );
  }

  // 4️⃣ Add member
  return this.prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: user.id,
      role: dto.role,
    },
  });
}


  async updateMemberRole(workspaceId: number, userId: number, updaterId: number, dto: UpdateMemberRoleDto) {
    const updater = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: updaterId } },
    });
console.log('Target userId:', userId);
console.log('Workspace ID:', workspaceId);

    if (!updater || updater.role !== WorkspaceMemberRole.ADMIN) {
      throw new ForbiddenException('Only admins can update roles');
    }

    return this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role: dto.role },
    });
  }

async listMembers(workspaceId: number) {
  return this.prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },  
  });
}

}
