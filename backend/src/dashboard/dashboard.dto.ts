 export class DashboardDto {
  projects: ProjectDto[];
  issues: IssueDto[];
  sprints: SprintDto[];
  comments: CommentDto[];
  pendingInvites: InviteDto[];
}

export class ProjectDto {
  id: string;
  name: string;
  workspaceId: number;
  workspaceName: string;
}

export class IssueDto {
  id: number;
  title: string;
  projectId: string;
  projectName: string;
  workspaceId: number;
}

export class SprintDto {
  id: number;
  name: string;
  status: string;
  projectId: string;
  projectName: string;
}

export class CommentDto {
  id: number;
  content: string;
  issueId: number;
  issueTitle: string;
  workspaceId: number;
  projectId: string;
  userName: string;
}

export class InviteDto {
  id: number;
  workspaceId: number;
  workspaceName: string;
}
