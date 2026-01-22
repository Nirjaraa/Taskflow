import { SetMetadata } from '@nestjs/common';
import { WorkspaceMemberRole } from '@prisma/client';

export const WORKSPACE_ROLES_KEY = 'workspace_roles';

export const RequireWorkspaceRole = (...roles: WorkspaceMemberRole[]) =>
  SetMetadata(WORKSPACE_ROLES_KEY, roles);
