import { IsString, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'This issue needs more details' })
  @IsString()
  content: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  issueId: number;
}

export class UpdateCommentDto {
  @ApiPropertyOptional({ example: 'Updated comment content' })
  @IsOptional()
  @IsString()
  content?: string;
}
