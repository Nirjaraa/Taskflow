import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNumber, IsNotEmpty, IsString } from 'class-validator';
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
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email of the user to invite',
  })
  @IsEmail()
  email: string;

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

export class DeleteWorkspaceDto {
  @IsNumber()
  workspaceId: number;
}
