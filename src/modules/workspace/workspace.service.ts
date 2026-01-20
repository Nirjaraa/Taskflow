import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto, InviteMemberDto, UpdateMemberRoleDto } from './workspace.dto';
import {  WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async createWorkspace(userId: number, dto: CreateWorkspaceDto) {
    return this.prisma.workspace.create({
      data: {
        name: dto.name,
        urlSlug: dto.urlSlug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: WorkspaceMemberRole.ADMIN,
          },
        },
      },
      include: { members: true },
    });
  }

  async listWorkspaces(userId: number) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: { members: true },
    });
  }

  async inviteMember(workspaceId: number, inviterId: number, dto: InviteMemberDto) {
    const inviter = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: inviterId } },//checks if invite is the admin as workspace and user are unique
    });
    if (!inviter || inviter.role !== WorkspaceMemberRole.ADMIN) {
      throw new ForbiddenException('Only admins can invite members');
    }

    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: dto.userId,
        },
      },
    });

    if (existingMember) {
      throw new ForbiddenException('User is already a member of this workspace');
    }

    /** 3️⃣ Add member */
    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: dto.userId,
        role: dto.role,
      },
    });
  }

  async updateMemberRole(workspaceId: number, userId: number, updaterId: number, dto: UpdateMemberRoleDto) {
    const updater = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: updaterId } },
    });
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
    });
  }
}
