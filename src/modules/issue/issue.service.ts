import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateIssueDto, UpdateIssueDto } from './issue-dto';
import { IssueStatus } from '@prisma/client';

@Injectable()
export class IssueService {
  constructor(private prisma: PrismaService) {}

  // ✅ GET /api/projects/:projectId/issues
  async findByProject(projectId: string, userId: number, filters: any) {
    return this.prisma.issue.findMany({
      where: {
        projectId,
        ...(filters.assignee === 'me' && { assigneeId: userId }),
        ...(filters.sprint === 'active' && {
          sprint: { status: 'ACTIVE' },
        }),
      },
      orderBy: { listPosition: 'asc' },
    });
  }

  // ✅ POST /api/issues
  async create(userId: number, projectId: string, dto: CreateIssueDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundException('Project not found');

    const lastIssue = await this.prisma.issue.findFirst({
      where: { projectId },
      orderBy: { ticketNumber: 'desc' },
    });

    const ticketNumber = (lastIssue?.ticketNumber ?? 100) + 1;

    return this.prisma.issue.create({
      data: {
        projectId,
        workspaceId: project.workspaceId,
        sprintId: dto.sprintId ?? null,
        ticketNumber,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        priority: dto.priority,
        assigneeId: dto.assigneeId,
        reporterId: userId,
        status: IssueStatus.TODO,
      },
    });
  }

  // ✅ PATCH /api/issues/:issueId
  async update(issueId: number, dto: UpdateIssueDto) {
    return this.prisma.issue.update({
      where: { id: issueId },
      data: dto,
    });
  }

  // ✅ DELETE /api/issues/:issueId
  async remove(issueId: number) {
    return this.prisma.issue.delete({
      where: { id: issueId },
    });
  }
}
