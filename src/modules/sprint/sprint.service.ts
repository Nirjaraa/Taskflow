import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSprintDto, UpdateSprintDto } from './sprint-dto';
import { SprintStatus } from '@prisma/client';

@Injectable()
export class SprintService {
  constructor(private prisma: PrismaService) {}

  // ✅ Create sprint under a project
  async create(projectId: string, dto: CreateSprintDto) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
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

  // ✅ Start / Complete sprint
  async update(sprintId: number, dto: UpdateSprintDto) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    if (sprint.status === SprintStatus.COMPLETED) {
      throw new BadRequestException('Completed sprint cannot be modified');
    }

    if (
      sprint.status === SprintStatus.PENDING &&
      dto.status === SprintStatus.COMPLETED
    ) {
      throw new BadRequestException('Sprint must be started before completing');
    }

    return this.prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: dto.status,
        startDate:
          dto.status === SprintStatus.ACTIVE ? new Date() : sprint.startDate,
        endDate:
          dto.status === SprintStatus.COMPLETED ? new Date() : sprint.endDate,
      },
    });
  }
}
