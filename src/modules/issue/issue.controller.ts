import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IssueService } from './issue.service';
import { CreateIssueDto, UpdateIssueDto } from './issue-dto';

@ApiTags('Issues')
@ApiBearerAuth() // Swagger shows JWT auth
@UseGuards(AuthGuard('jwt')) // Apply JWT guard to all routes
@Controller('api')
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  // ✅ GET /api/projects/:projectId/issues?assignee=me&sprint=active
  @Get('projects/:projectId/issues')
  findAll(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Query() filters: any,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.issueService.findByProject(projectId, userId, filters);
  }

  // ✅ POST /api/issues?projectId=<uuid>
  @Post('issues')
  create(
    @Req() req: any,
    @Query('projectId') projectId: string,
    @Body() dto: CreateIssueDto,
  ) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException('User not logged in');

    return this.issueService.create(userId, projectId, dto);
  }

  // ✅ PATCH /api/issues/:issueId
  @Patch('issues/:issueId')
  update(
    @Param('issueId') issueId: string,
    @Body() dto: UpdateIssueDto,
  ) {
    return this.issueService.update(Number(issueId), dto);
  }

  // ✅ DELETE /api/issues/:issueId
  @Delete('issues/:issueId')
  remove(@Param('issueId') issueId: string) {
    return this.issueService.remove(Number(issueId));
  }
}
