import api from './axios';

// ---- Register ----
export const register = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post('/auth/register', data);

// ---- Login ----
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data);

// ---- Get current user ----
export const getMe = () => api.get('/auth/me');

// ---- Update profile ----
export const updateProfile = (data: { name?: string; email?: string }) =>
  api.patch('/auth/profile', data);

// ---- Forgot / Reset password ----
export const forgotPassword = (email: string) =>
  api.post('/auth/forgot-password', { email });

export const resetPassword = (token: string, newPassword: string) =>
  api.post('/auth/reset-password', { token, newPassword });

// ---- Token helpers ----

// Save JWT token in localStorage and set default header
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Load token from localStorage (on page load)
export const loadToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  return token;
};

// Remove token (logout)
export const removeToken = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

 
export const createWorkspace = (data: { name: string; urlSlug: string }) =>
  api.post('/workspaces', data);

export const listWorkspaces = () =>
  api.get('/workspaces');

export const listMembers = (workspaceId: number) =>
  api.get(`/workspaces/${workspaceId}/members`);

export const inviteMember = (
  workspaceId: number,
  data: { email: string; role: 'ADMIN' | 'MEMBER'|'GUEST' }
) =>
  api.post(`/workspaces/${workspaceId}/members/invite`, data);

  export const updateMemberRole = (
  workspaceId: number,
  userId: number,
  newRole: 'ADMIN' | 'MEMBER' | 'GUEST'
) => {
  return api.patch(
    `/workspaces/${workspaceId}/members/${userId}/role`,
    { role: newRole }
  );
};


  // List projects in a workspace
export const listProjects = (workspaceId: number) =>
  api.get(`/project/workspace/${workspaceId}`);

export const getProject = async (_workspaceId: string, projectId: string) => {
  const res = await api.get(`/project/${projectId}`);
  return res.data;
};

export const deleteProject = async (projectId: string) => {
  const res = await api.delete(`/project/${projectId}`);
  return res.data;
};

export const listSprints = async (projectId: string) => {
  const res = await api.get(`/api/projects/${projectId}/sprints`);
  return res.data;
};

// ---- Create Sprint ----
export const createSprint = async (
  projectId: string,
  name: string,
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' = 'PENDING'
) => {
  const res = await api.post(`/api/projects/${projectId}/sprints`, { name, status });
  return res.data;
};

// ---- Update Sprint ----
export const updateSprint = async (
  sprintId: string,
  name?: string,
  status?: 'PENDING' | 'ACTIVE' | 'COMPLETED'
) => {
  const payload: { name?: string; status?: 'PENDING' | 'ACTIVE' | 'COMPLETED' } = {};
  if (name) payload.name = name;
  if (status) payload.status = status;

  const res = await api.patch(`/api/sprints/${sprintId}`, payload);
  return res.data;
};

export const deleteSprint = async (sprintId: string) => {
  const res = await api.delete(`/api/sprints/${sprintId}`);
  return res.data;
};

export const createProject = (workspaceId: number, data: { name: string; description?: string }) =>
  api.post('/project', {
    workspaceId,
    name: data.name,
    description: data.description || '',
  });

  // ---- Issues ----
export const listIssues = async (
  projectId: string,
  filters?: { assignee?: 'me'; sprint?: string }
) => {
  const res = await api.get(`api/projects/${projectId}/issues`, { params: filters });
  return res.data;
};

export const createIssue = async (
  projectId: string,
  data: { 
    title: string; 
    description?: string; 
    type: 'BUG' | 'FEATURE' | 'TASK';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    sprintId?: string;
    assigneeId?: number;
  }
) => {
  const res = await api.post(`api/issues?projectId=${projectId}`, data);
  return res.data;
};

export const updateIssue = async (
  issueId: string,
  data: { 
    title?: string; 
    description?: string; 
    type?: 'BUG' | 'FEATURE' | 'TASK';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: 'PENDING' | 'ACTIVE' | 'COMPLETED'; 
    sprintId?: string;
    assigneeId?: number;
  }
) => {
  const res = await api.patch(`api/issues/${issueId}`, data);
  return res.data;
};

export const deleteIssue = async (issueId: string) => {
  const res = await api.delete(`api/issues/${issueId}`);
  return res.data;
};
// ---- Comments ----
export const listComments = async (issueId: string) => {
  const res = await api.get(`/comments/issue/${issueId}`);
  return res.data;
};

export const createComment = async (issueId: string, content: string) => {
  const res = await api.post(`/comments`, { issueId, content });
  return res.data;
};

export const updateComment = async (commentId: string, content: string) => {
  const res = await api.patch(`/comments/${commentId}`, { content });
  return res.data;
};

export const deleteComment = async (commentId: string) => {
  const res = await api.delete(`/comments/${commentId}`);
  return res.data;
};

export const deleteWorkspace = async (workspaceId: number) => {
  try {
     
    await loadToken();

     const res = await api.delete(`/workspaces/${workspaceId}`);

     return res.data;
  } catch (error: any) {
    console.error('Error deleting workspace:', error);
    throw error;  
  }
};