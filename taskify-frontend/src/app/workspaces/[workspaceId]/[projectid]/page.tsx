'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import {
  getProject,
  listSprints,
  loadToken,
  deleteProject,
  createSprint,
  updateSprint,
  deleteSprint,
  listIssues,
  createIssue,
  updateIssue,
  deleteIssue,
  listComments,
  createComment,
} from '../../../lib/auth';
import { ChevronDown, ChevronUp, Trash2, Edit, Plus, X, MessageCircle } from 'lucide-react';

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
    {message}
    <button onClick={onClose} className="text-white hover:text-gray-200">
      <X size={18} />
    </button>
  </div>
);

const toStringParam = (p: string | string[] | undefined) => Array.isArray(p) ? p[0] : p || '';

export default function ProjectDetailPage() {
  const { workspaceId, projectid } = useParams();
  const router = useRouter();
  const wsId = toStringParam(workspaceId);
  const projId = toStringParam(projectid);

  if (!wsId || !projId) return <div>Invalid URL</div>;

  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // UI state
  const [showSprints, setShowSprints] = useState(true);
  const [showIssues, setShowIssues] = useState(true);

  // Sprint modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState('');
  const [modalStatus, setModalStatus] = useState<'PENDING' | 'ACTIVE' | 'COMPLETED'>('PENDING');
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);

  // Issue modal state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [issueType, setIssueType] = useState<'BUG' | 'FEATURE' | 'TASK'>('TASK');
  const [issuePriority, setIssuePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [issueSprintId, setIssueSprintId] = useState<string | null>(null);
  const [issueStatus, setIssueStatus] = useState<'PENDING' | 'ACTIVE' | 'COMPLETED'>('PENDING');
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);

  // Comments modal state
  const [commentsModalOpen, setCommentsModalOpen] = useState(false);
  const [activeIssue, setActiveIssue] = useState<any | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  // ---------- Fetch project, sprints & issues ----------
  useEffect(() => {
    const fetchData = async () => {
      loadToken();
      try {
        const projectRes = await getProject(wsId, projId);
        setProject(projectRes);
        setIsAdmin(projectRes.role === 'ADMIN');
      } catch (err: any) {
        console.error(err);
        router.replace(`/workspaces/${wsId}`);
        return;
      }

      try {
        const sprintsRes = await listSprints(projId);
        setSprints(sprintsRes);
      } catch (err: any) {
        console.error(err);
        setToast('Failed to load sprints');
      }

      try {
        const issuesRes = await listIssues(projId);
        setIssues(issuesRes);
      } catch (err: any) {
        console.error(err);
        setToast('Failed to load issues');
      }

      setLoading(false);
    };
    fetchData();
  }, [wsId, projId, router]);

  // ---------- Project actions ----------
  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteProject(projId);
      router.push(`/workspaces/${wsId}`);
    } catch (err: any) {
      console.error(err);
      setToast(err.response?.data?.message || 'Failed to delete project');
    }
  };

  // ---------- Sprint actions ----------
  const handleDeleteSprint = async (id: string) => {
    if (!confirm('Delete this sprint?')) return;
    try {
      await deleteSprint(id);
      setSprints(sprints.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error(err);
      setToast(err.response?.data?.message || 'Failed to delete sprint');
    }
  };

  const handleOpenSprintModal = (sprintId?: string, name?: string, status?: string) => {
    setEditingSprintId(sprintId || null);
    setModalValue(name || '');
    setModalStatus((status as 'PENDING' | 'ACTIVE' | 'COMPLETED') || 'PENDING');
    setModalOpen(true);
  };

  const handleSprintModalSubmit = async () => {
    if (!modalValue.trim()) return;
    try {
      if (editingSprintId) {
        await updateSprint(editingSprintId, modalValue, modalStatus);
        setSprints(
          sprints.map((s) =>
            s.id === editingSprintId ? { ...s, name: modalValue, status: modalStatus } : s
          )
        );
      } else {
        const newSprint = await createSprint(projId, modalValue, modalStatus);
        setSprints([...sprints, newSprint]);
      }
      setModalOpen(false);
      setModalValue('');
      setModalStatus('PENDING');
      setEditingSprintId(null);
    } catch (err: any) {
      console.error(err);
      setToast(err.response?.data?.message || 'Failed to save sprint');
    }
  };

  // ---------- Issue actions ----------
  const handleDeleteIssue = async (id: string) => {
    if (!confirm('Delete this issue?')) return;
    try {
      await deleteIssue(id);
      setIssues(issues.filter((i) => i.id !== id));
    } catch (err: any) {
      console.error(err);
      setToast(err.response?.data?.message || 'Failed to delete issue');
    }
  };

  const handleOpenIssueModal = (issue?: any) => {
    if (issue) {
      setEditingIssueId(issue.id);
      setIssueTitle(issue.title || '');
      setIssueDescription(issue.description || '');
      setIssueType(issue.type || 'TASK');
      setIssuePriority(issue.priority || 'MEDIUM');
      setIssueSprintId(issue.sprintId || null);
      setIssueStatus(issue.status || 'PENDING');
    } else {
      setEditingIssueId(null);
      setIssueTitle('');
      setIssueDescription('');
      setIssueType('TASK');
      setIssuePriority('MEDIUM');
      setIssueSprintId(null);
      setIssueStatus('PENDING');
    }
    setIssueModalOpen(true);
  };

  const handleIssueModalSubmit = async () => {
    if (!issueTitle.trim()) return;

    const issueData: any = {
      title: issueTitle,
      description: issueDescription,
      type: issueType,
      priority: issuePriority,
      sprintId: issueSprintId || null,
      status: issueStatus
    };

    try {
      if (editingIssueId) {
        const updatedIssue = await updateIssue(editingIssueId, issueData);
        setIssues(issues.map(i => i.id === editingIssueId ? updatedIssue : i));
      } else {
        const newIssue = await createIssue(projId, issueData);
        setIssues([...issues, newIssue]);
      }

      // Reset modal
      setIssueModalOpen(false);
      setEditingIssueId(null);
      setIssueTitle('');
      setIssueDescription('');
      setIssueType('TASK');
      setIssuePriority('MEDIUM');
      setIssueSprintId(null);
      setIssueStatus('PENDING');
    } catch (err: any) {
      console.error(err);
      setToast(err.response?.data?.message || 'Failed to save issue');
    }
  };

  // ---------- Comments ----------
  const handleOpenComments = async (issue: any) => {
    try {
      const res = await listComments(issue.id);
      setComments(res);
      setActiveIssue(issue);
      setCommentsModalOpen(true);
    } catch {
      setToast('Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeIssue) return;
    try {
      const comment = await createComment(activeIssue.id, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch {
      setToast('Failed to add comment');
    }
  };

  // ---------- Helpers ----------
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BUG': return 'text-red-600 bg-red-50';
      case 'FEATURE': return 'text-blue-600 bg-blue-50';
      case 'TASK': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) return <div className="p-8">Loading project...</div>;
  if (!project) return <div className="p-8">Project not found</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>

          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={handleDeleteProject}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}

            <button
              onClick={() => router.push(`/workspaces/${wsId}`)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Back to Workspace
            </button>
          </div>
        </div>

        {project.description && (
          <p className="text-gray-600 mb-6">{project.description}</p>
        )}

        {/* SPRINTS */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6">
  <button
    onClick={() => setShowSprints(!showSprints)}
    className="w-full flex items-center justify-between text-xl font-semibold mb-4 text-purple-800"
  >
    <span>Sprints</span>
    {showSprints ? <ChevronUp /> : <ChevronDown />}
  </button>

  {showSprints && (
    <div className="space-y-2">
      {sprints.length === 0 ? (
        <p className="text-gray-500 italic">No sprints yet.</p>
      ) : (
        sprints.map((s) => (
          <div
            key={s.id}
            className="flex justify-between items-center p-3 border rounded hover:bg-purple-50 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-purple-700">{s.name}</span>
              <span
                className={`px-2 py-1 text-xs rounded font-medium ${
                  s.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : s.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {s.status}
              </span>
            </div>

            {isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenSprintModal(s.id, s.name, s.status)}
                  className="p-1 hover:bg-purple-100 rounded text-purple-600 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteSprint(s.id)}
                  className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {isAdmin && (
        <button
          onClick={() => handleOpenSprintModal()}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
        >
          <Plus size={16} /> Add Sprint
        </button>
      )}
    </div>
  )}
</div>


        {/* ISSUES */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => setShowIssues(!showIssues)}
            className="w-full flex items-center justify-between text-xl font-semibold mb-4 text-purple-800"
          >
            <span>Issues</span>
            {showIssues ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showIssues && (
            <div className="space-y-3">
              {issues.length === 0 ? (
                <p className="text-gray-500 italic">No issues yet.</p>
              ) : (
                issues.map((i) => (
                  <div key={i.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span className="font-medium">{i.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getTypeColor(i.type)}`}>{i.type}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(i.priority)}`}>{i.priority}</span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          i.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          i.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-200 text-gray-700'
                        }`}>{i.status}</span>
                      </div>
                      {i.description && <p className="text-sm text-gray-600">{i.description}</p>}
                    </div>

                    <div className="flex gap-2 mt-2 md:mt-0">
                      <button
                        onClick={() => handleOpenComments(i)}
                        className="p-1 hover:bg-gray-200 rounded text-blue-600"
                      >
                        <MessageCircle size={16} />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenIssueModal(i)}
                            className="p-1 hover:bg-gray-200 rounded text-blue-600"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(i.id)}
                            className="p-1 hover:bg-gray-200 rounded text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}

              {isAdmin && (
                <button
                  onClick={() => handleOpenIssueModal()}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  <Plus size={16} /> Add Issue
                </button>
              )}
            </div>
          )}
        </div>

        {/* ================= COMMENTS MODAL ================= */}
        {commentsModalOpen && activeIssue && (
  <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-xl">
              <div className="p-4 border-b flex justify-between">
                <div>
                  <h2 className="font-bold text-purple-800">Comments</h2>
                  <p className="text-sm text-gray-500">{activeIssue.title}</p>
                </div>
                <button onClick={() => setCommentsModalOpen(false)}><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No comments yet.</p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="bg-gray-50 border rounded p-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-sm">{c.user?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm mt-1">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t p-4 flex gap-2">
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 p-2 border rounded"
                />
                <button onClick={handleAddComment} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Send</button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TOAST ================= */}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}

        {/* ================= ISSUE MODAL ================= */}
        {issueModalOpen && (
<div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl flex flex-col">
              <h2 className="text-xl font-bold text-purple-800 mb-4">{editingIssueId ? 'Edit Issue' : 'Add Issue'}</h2>

              <input
                placeholder="Title"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                className="mb-2 p-2 border rounded"
              />
              <textarea
                placeholder="Description"
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="mb-2 p-2 border rounded"
              />

              <div className="flex gap-2 mb-2">
                <select value={issueType} onChange={(e) => setIssueType(e.target.value as any)} className="flex-1 p-2 border rounded">
                  <option value="TASK">Task</option>
                  <option value="FEATURE">Feature</option>
                  <option value="BUG">Bug</option>
                </select>

                <select value={issuePriority} onChange={(e) => setIssuePriority(e.target.value as any)} className="flex-1 p-2 border rounded">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {editingIssueId && (
                <select value={issueStatus} onChange={(e) => setIssueStatus(e.target.value as any)} className="mb-2 p-2 border rounded w-full">
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              )}

              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setIssueModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                <button onClick={handleIssueModalSubmit} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  {editingIssueId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SPRINT MODAL ================= */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl flex flex-col">
              <h2 className="text-xl font-bold text-purple-800 mb-4">{editingSprintId ? 'Edit Sprint' : 'Add Sprint'}</h2>

              <input
                placeholder="Sprint Name"
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
                className="mb-2 p-2 border rounded"
              />
              <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value as any)} className="mb-2 p-2 border rounded w-full">
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancel</button>
                <button onClick={handleSprintModalSubmit} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  {editingSprintId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
