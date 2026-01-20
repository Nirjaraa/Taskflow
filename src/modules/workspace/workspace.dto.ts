import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { WorkspaceMemberRole } from '@prisma/client';  

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Marketing Team' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'marketing-team' })
  @IsString()
  @IsNotEmpty()
  urlSlug: string;
}

export class InviteMemberDto {
  @ApiProperty({ example: 2, description: 'User ID to invite' })
  @IsInt()
  @Min(1)
  userId: number;

  @ApiProperty({
    example: WorkspaceMemberRole.MEMBER,
    enum: WorkspaceMemberRole,
  })
  @IsEnum(WorkspaceMemberRole)
  role: WorkspaceMemberRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({
    example: WorkspaceMemberRole.ADMIN,
    enum: WorkspaceMemberRole,
  })
  @IsEnum(WorkspaceMemberRole)
  role: WorkspaceMemberRole;
}