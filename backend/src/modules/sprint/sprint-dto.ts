import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty ,ApiPropertyOptional} from '@nestjs/swagger';
import { SprintStatus } from '@prisma/client';

export class CreateSprintDto {
  @ApiProperty({
    description: 'Name of the sprint',
    example: 'Sprint 1 – Authentication',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Sprint start date (ISO format)',
    example: '2026-01-25T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Sprint end date (ISO format)',
    example: '2026-02-05T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}


export class UpdateSprintDto {
  @ApiProperty({
    description: 'New sprint status',
    enum: SprintStatus,
    example: SprintStatus.ACTIVE,
  })
  @IsEnum(SprintStatus)
  status: SprintStatus;
}
