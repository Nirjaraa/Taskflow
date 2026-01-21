import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { WorkspaceRoleGuard } from 'src/common/guards/workspace-role.guard';

@Module({
  controllers: [WorkspaceController],
  providers: [WorkspaceService, PrismaService,WorkspaceRoleGuard],
})
export class WorkspaceModule {}
