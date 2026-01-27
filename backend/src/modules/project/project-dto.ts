import { IsString, IsOptional, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 1, description: 'Workspace ID' })
  @IsInt()   
  workspaceId: number;

  @ApiProperty({
    description: 'Name of the project',
    example: 'Frontends Website',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Unique project key',
    example: 'FE',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiPropertyOptional({
    description: 'Optional project description',
    example: 'This project handles the frontend tasks',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Updated project name',
    example: 'Updated Frontend Website',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated project description',
    example: 'Updated description for the project',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
