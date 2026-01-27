import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: number) {

    /* 1️⃣ Workspaces user belongs to */
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId, status: 'ACCEPTED' } } },
        ],
      },
      select: { id: true, name: true },
    });

    const workspaceIds = workspaces.map(w => w.id);

    /* 2️⃣ Pending invites */
    const pendingInvites = await this.prisma.workspaceMember.findMany({
      where: { userId, status: 'PENDING' },
      include: { workspace: true },
    });

    /* 3️⃣ Projects in those workspaces */
    const projects = await this.prisma.project.findMany({
      where: { workspaceId: { in: workspaceIds } },
      include: { workspace: true },
      orderBy: { createdAt: 'desc' },
    });

    /* 4️⃣ Issues in those workspaces (NO ASSIGNEE FILTER) */
    const issues = await this.prisma.issue.findMany({
      where: {
        workspaceId: { in: workspaceIds },
      },
      include: {
        project: true,
        workspace: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const issueIds = issues.map(i => i.id);

    /* 5️⃣ Comments on those issues */
    const comments = await this.prisma.comment.findMany({
      where: {
        issueId: { in: issueIds },
      },
      include: {
        issue: {
          include: { project: true, workspace: true },
        },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      workspaces,
      pendingInvites: pendingInvites.map(inv => ({
        id: inv.id,
        workspaceId: inv.workspaceId,
        workspaceName: inv.workspace.name,
      })),
      projects,
      issues,
      comments,
    };
  }
}
