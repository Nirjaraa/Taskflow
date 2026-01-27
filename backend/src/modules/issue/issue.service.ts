import { Injectable, NotFoundException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIssueDto, UpdateIssueDto } from './issue-dto';
import { IssueStatus, WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class IssueService {
  constructor(private prisma: PrismaService) {}

  // ✅ Get issues by project (with filters)
  async findByProject(projectId: string, userId: number, filters: any) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    // Check workspace membership
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
    });
    if (!membership || membership.role === WorkspaceMemberRole.GUEST) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    return this.prisma.issue.findMany({
      where: {
        projectId,
        ...(filters.sprint === 'active' && { sprint: { status: 'ACTIVE' } }),
        ...(filters.assignee === 'me' && { assigneeId: userId }),
      },
      orderBy: { listPosition: 'asc' },
    });
  }

  // ✅ Create issue
  async create(userId: number, projectId: string, dto: CreateIssueDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    // Check workspace membership
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
    });
    if (!membership || membership.role === WorkspaceMemberRole.GUEST) {
      throw new ForbiddenException('You are not allowed to create issues in this workspace');
    }

    // Auto ticketNumber
    const lastIssue = await this.prisma.issue.findFirst({
      where: { projectId },
      orderBy: { ticketNumber: 'desc' },
    });
    const ticketNumber = lastIssue ? lastIssue.ticketNumber + 1 : 1;

    return this.prisma.issue.create({
      data: {
        projectId,
        workspaceId: project.workspaceId,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        sprintId: dto.sprintId || null,
        assigneeId: dto.assigneeId || null,
        reporterId: userId,
        ticketNumber,
      },
    });
  }

   async update(userId: number, issueId: number, dto: UpdateIssueDto) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found');

    // Check workspace membership
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: issue.workspaceId, userId } },
    });
    const isAdmin = membership?.role === WorkspaceMemberRole.ADMIN;
    const isMember = membership?.role === WorkspaceMemberRole.MEMBER;
    const isReporter = issue.reporterId === userId;

    if (!isAdmin && !isMember && !isReporter) {
      throw new ForbiddenException('You cannot update this issue');
    }

    return this.prisma.issue.update({ where: { id: issueId }, data: dto });
  }

   async remove(userId: number, issueId: number) {
    const issue = await this.prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) throw new NotFoundException('Issue not found');

    // Check workspace membership
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: issue.workspaceId, userId } },
    });
    const isAdmin = membership?.role === WorkspaceMemberRole.ADMIN;
    const isReporter = issue.reporterId === userId;

    if (!isAdmin && !isReporter) {
      throw new ForbiddenException('You cannot delete this issue');
    }

    return this.prisma.issue.delete({ where: { id: issueId } });
  }

   async listNewIssues(userId: number) {
    const issues = await this.prisma.issue.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' }, // only active issues
      },
      include: {
        project: true,
        workspace: true,
      },
    });

    return issues.map(i => ({
      id: i.id,
      title: i.title,
      projectId: i.projectId,
      projectName: i.project.name,
      workspaceId: i.workspaceId,
      workspaceName: i.workspace.name,
      status: i.status,
      priority: i.priority,
    }));
  }
}
