import { Controller, Post, Patch, Param, Body } from '@nestjs/common';
import { SprintService } from './sprint.service';
import { CreateSprintDto, UpdateSprintDto } from './sprint-dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Sprints')
@Controller('api')
export class SprintController {
  constructor(private readonly sprintService: SprintService) {}

  // ✅ POST /api/projects/:projectId/sprints
  @Post('projects/:projectId/sprints')
  @ApiOperation({ summary: 'Create a sprint under a project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    example: 'c2a5c1a4-6e2f-4d9e-b3c1-abc123456789',
  })
  createSprint(
    @Param('projectId') projectId: string,
    @Body() dto: CreateSprintDto,
  ) {
    return this.sprintService.create(projectId, dto);
  }

  // ✅ PATCH /api/sprints/:sprintId
  @Patch('sprints/:sprintId')
  @ApiOperation({ summary: 'Start or complete a sprint' })
  @ApiParam({
    name: 'sprintId',
    description: 'Sprint ID',
    example: 1,
  })
  update(
    @Param('sprintId') sprintId: string,
    @Body() dto: UpdateSprintDto,
  ) {
    return this.sprintService.update(Number(sprintId), dto);
  }
}
