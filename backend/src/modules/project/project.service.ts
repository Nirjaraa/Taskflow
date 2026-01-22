import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  // 🔐 Internal access check
  async verifyWorkspaceAccess(userId: string, workspaceId: number) {
  const member = await this.prisma.workspaceMember.findFirst({
    where: {
      userId: Number(userId),    // convert userId if it's string from JWT
      workspaceId: Number(workspaceId), // ensure it's a number
    },
  });

  if (!member) {
    throw new ForbiddenException('Access denied to workspace');
  }

  return member;
}


  // ✅ Create Project
  async create(userId: string, dto: any) {
    await this.verifyWorkspaceAccess(userId, dto.workspaceId);

    return this.prisma.project.create({
      data: {
        workspaceId: Number(dto.workspaceId), // make sure number
        name: dto.name,
        key: dto.key,
        description: dto.description,
      },
    });
  }

  // ✅ List Projects in Workspace
  async findAll(userId: string, workspaceId: number) {
    await this.verifyWorkspaceAccess(userId, workspaceId);

    return this.prisma.project.findMany({
    where: { workspaceId: Number(workspaceId) },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ✅ Get Single Project
  async findOne(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new NotFoundException('Project not found');

    await this.verifyWorkspaceAccess(userId, project.workspaceId);

    return project;
  }

  // ✅ Update Project
  async update(userId: string, projectId: string, dto: any) {
    const project = await this.findOne(userId, projectId);

    return this.prisma.project.update({
      where: { id: project.id },
      data: dto,
    });
  }

  // ✅ Delete Project
  async remove(userId: string, projectId: string) {
    const project = await this.findOne(userId, projectId);

    return this.prisma.project.delete({
      where: { id: project.id },
    });
  }
}
