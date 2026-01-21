import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssueStatus, IssuePriority, IssueType } from '@prisma/client';

export class CreateIssueDto {
  @ApiProperty({ example: 'Login page not loading', description: 'Title of the issue' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Occurs on Firefox only', description: 'Detailed description of the issue' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: IssueType, example: IssueType.BUG, description: 'Type of the issue' })
  @IsEnum(IssueType)
  type: IssueType;

  @ApiProperty({ enum: IssuePriority, example: IssuePriority.HIGH, description: 'Priority of the issue' })
  @IsEnum(IssuePriority)
  priority: IssuePriority;

  @ApiPropertyOptional({ description: 'Sprint ID (omit or null = backlog)', example: null })
  @IsOptional()
  @IsInt()
  sprintId?: number | null; // allow null explicitly

  @ApiPropertyOptional({ description: 'Assignee user ID', example: 1 })
  @IsOptional()
  @IsInt()
  assigneeId?: number;
}

export class UpdateIssueDto {
  @ApiPropertyOptional({ enum: IssueStatus, description: 'Update issue status', example: IssueStatus.IN_PROGRESS })
  @IsOptional()
  @IsEnum(IssueStatus)
  status?: IssueStatus;

  @ApiPropertyOptional({ description: 'Move to sprint (null = backlog)', example: null })
  @IsOptional()
  @IsInt()
  sprintId?: number | null;

  @ApiPropertyOptional({ description: 'Assign user by ID', example: 2 })
  @IsOptional()
  @IsInt()
  assigneeId?: number;

  @ApiPropertyOptional({ description: 'List position for drag & drop ordering', example: 1.5 })
  @IsOptional()
  @IsNumber()
  listPosition?: number;
}
