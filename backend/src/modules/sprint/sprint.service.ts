import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSprintDto, UpdateSprintDto } from './sprint-dto';
import { SprintStatus, WorkspaceMemberRole } from '@prisma/client';

@Injectable()
export class SprintService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create sprint under a project (Admin only)
  async create(userId: number, projectId: string, dto: CreateSprintDto) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    // Check if user is workspace admin
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
    });
    if (!member || member.role !== WorkspaceMemberRole.ADMIN) {
      throw new UnauthorizedException('Only admins can create sprints');
    }

    return this.prisma.sprint.create({
      data: {
        projectId,
        name: dto.name,
        status: SprintStatus.PENDING,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  // ✅ Update sprint (Admin only)
  async update(userId: number, sprintId: number, dto: UpdateSprintDto) {
    const sprint = await this.prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) throw new NotFoundException('Sprint not found');

    // Fetch the project to get the workspaceId
    const project = await this.prisma.project.findUnique({ where: { id: sprint.projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
    });
    if (!member || member.role !== WorkspaceMemberRole.ADMIN) {
      throw new UnauthorizedException('Only admins can update sprints');
    }

    if (sprint.status === SprintStatus.COMPLETED) {
      throw new BadRequestException('Completed sprint cannot be modified');
    }
    if (sprint.status === SprintStatus.PENDING && dto.status === SprintStatus.COMPLETED) {
      throw new BadRequestException('Sprint must be started before completing');
    }

    return this.prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: dto.status,
        startDate: dto.status === SprintStatus.ACTIVE ? new Date() : sprint.startDate,
        endDate: dto.status === SprintStatus.COMPLETED ? new Date() : sprint.endDate,
      },
    });
  }

  // ✅ Get all sprints of a project (any member or guest)
  async findByProject(userId: number, projectId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new NotFoundException('Project not found');

    // Check if user is part of workspace
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: project.workspaceId, userId } },
    });
    if (!member) throw new UnauthorizedException('You are not a member of this workspace');

    return this.prisma.sprint.findMany({
      where: { projectId },
      orderBy: { startDate: 'asc' },
    });
  }
}
