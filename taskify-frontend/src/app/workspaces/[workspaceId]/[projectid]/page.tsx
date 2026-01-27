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
  deleteComment,
  updateComment
} from '../../../lib/auth';
import { ChevronDown, ChevronUp, Trash2, Edit, Plus, X, MessageCircle } from 'lucide-react';

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
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
  const [showSprints, setShowSprints] = useState(true);
  const [showIssues, setShowIssues] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
const [activeCommentsIssueId, setActiveCommentsIssueId] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

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

  // ---------- Fetch project, sprints & issues ----------
  useEffect(() => {
    const fetchData = async () => {
      loadToken();
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);

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
        if (err.response?.status !== 404) setToast('Failed to load issues');
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
    try {
      const issueData: any = {
        title: issueTitle,
        description: issueDescription,
        type: issueType,
        priority: issuePriority,
        sprintId: issueSprintId || undefined,
      };

      if (editingIssueId) {
        issueData.status = issueStatus;
        await updateIssue(editingIssueId, issueData);
        setIssues(
          issues.map((i) =>
            i.id === editingIssueId ? { ...i, ...issueData } : i
          )
        );
      } else {
        const newIssue = await createIssue(projId, issueData);
        setIssues([...issues, newIssue]);
      }
      setIssueModalOpen(false);
      setEditingIssueId(null);
    } catch (err: any) {
      console.error(err);
      setToast(err.response?.data?.message || 'Failed to save issue');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeCommentsIssueId) return;
    try {
      const comment = await createComment(activeCommentsIssueId, newComment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch {
      setToast('Failed to add comment');
    }
  };

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

  if (loading) return <div>Loading project...</div>;
  if (!project) return <div>Project not found</div>;

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
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                <Trash2 size={16} /> Delete
              </button>
            )}
            <button
              onClick={() => router.push(`/workspaces/${wsId}`)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Back to Workspace
            </button>
          </div>
        </div>

        {project.description && (
          <p className="text-gray-600 mb-6">{project.description}</p>
        )}

        {/* Sprints Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => setShowSprints(!showSprints)}
            className="w-full flex items-center justify-between text-xl font-semibold text-gray-800 mb-4"
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
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.name}</span>
                      <span
                        className={`ml-2 px-2 py-1 text-sm rounded font-medium ${
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
                          className="p-1 hover:bg-gray-200 rounded text-blue-600"
                          title="Edit Sprint"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSprint(s.id)}
                          className="p-1 hover:bg-gray-200 rounded text-red-600"
                          title="Delete Sprint"
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
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                >
                  <Plus size={16} /> Add Sprint
                </button>
              )}
            </div>
          )}
        </div>

        {/* Issues Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={() => setShowIssues(!showIssues)}
            className="w-full flex items-center justify-between text-xl font-semibold text-gray-800 mb-4"
          >
            <span>Issues</span>
            {showIssues ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showIssues && (
            <div className="space-y-2">
              {issues.length === 0 ? (
                <p className="text-gray-500 italic">No issues yet.</p>
              ) : (
                issues.map((i) => (
                  <div
                    key={i.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded hover:bg-gray-50 shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-medium">{i.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getTypeColor(i.type)}`}>{i.type}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(i.priority)}`}>{i.priority}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${
                            i.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : i.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {i.status}
                        </span>
                      </div>
                      {i.description && <p className="text-sm text-gray-600">{i.description}</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 items-center mt-2 md:mt-0">
                      {/* Comments toggle */}
                      <button
                        onClick={async () => {
                          if (activeCommentsIssueId === i.id) {
                            setActiveCommentsIssueId(null);
                          } else {
                            setActiveCommentsIssueId(i.id);
                            try {
                              const commentsRes = await listComments(i.id);
                              setComments(commentsRes);
                            } catch {
                              setToast('Failed to load comments');
                            }
                          }
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-blue-600"
                        title="Comments"
                      >
                        <MessageCircle size={16} />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenIssueModal(i)}
                            className="p-1 hover:bg-gray-200 rounded text-blue-600"
                            title="Edit Issue"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteIssue(i.id)}
                            className="p-1 hover:bg-gray-200 rounded text-red-600"
                            title="Delete Issue"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Comments Section */}
                    {activeCommentsIssueId === i.id && (
                      <div className="mt-4 bg-gray-50 rounded p-3 space-y-2 border-t">
                        {comments.map((c) => (
                          <div
                            key={c.id}
                            className="flex justify-between items-start p-2 border-b last:border-b-0 rounded hover:bg-gray-100"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-sm">{c.user?.name || 'Unknown'}: </span>
                              <span className="text-sm">{c.content}</span>
                              <span className="text-xs text-gray-400 ml-2">
                                {new Date(c.createdAt).toLocaleString()}
                              </span>
                            </div>

                            {(c.userId === project.userId || project.role === 'ADMIN') && (
                              <div className="flex gap-1 ml-2">
                                <button
                                  onClick={async () => {
                                    const newContent = prompt('Edit comment', c.content);
                                    if (newContent && newContent !== c.content) {
                                      try {
                                        const updated = await updateComment(c.id, newContent);
                                        setComments(
                                          comments.map((com) =>
                                            com.id === c.id ? updated : com
                                          )
                                        );
                                      } catch {
                                        setToast('Failed to update comment');
                                      }
                                    }
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded text-blue-600"
                                  title="Edit Comment"
                                >
                                  <Edit size={16} />
                                </button>

                                <button
                                  onClick={async () => {
                                    if (confirm('Delete this comment?')) {
                                      try {
                                        await deleteComment(c.id);
                                        setComments(
                                          comments.filter((com) => com.id !== c.id)
                                        );
                                      } catch {
                                        setToast('Failed to delete comment');
                                      }
                                    }
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded text-red-600"
                                  title="Delete Comment"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add Comment */}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 p-2 border rounded"
                            placeholder="Add comment"
                          />
                          <button
                            onClick={handleAddComment}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isAdmin && (
                <button
                  onClick={() => handleOpenIssueModal()}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition"
                >
                  <Plus size={16} /> Add Issue
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sprint Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">{editingSprintId ? 'Edit Sprint' : 'Create Sprint'}</h2>

              <label className="block mb-2 text-sm font-medium">Sprint Name</label>
              <input
                type="text"
                value={modalValue}
                onChange={(e) => setModalValue(e.target.value)}
                className="w-full p-2 border rounded mb-4"
                placeholder="Enter sprint name"
              />

              <label className="block mb-2 text-sm font-medium">Status</label>
              <div className="flex gap-2 mb-4">
                {['PENDING', 'ACTIVE', 'COMPLETED'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setModalStatus(s as 'PENDING' | 'ACTIVE' | 'COMPLETED')}
                    className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                      modalStatus === s
                        ? s === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : s === 'COMPLETED'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSprintModalSubmit}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  {editingSprintId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Issue Modal */}
        {issueModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
              <h2 className="text-xl font-bold mb-4">{editingIssueId ? 'Edit Issue' : 'Create Issue'}</h2>

              <label className="block mb-2 text-sm font-medium">Title</label>
              <input
                type="text"
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />

              <label className="block mb-2 text-sm font-medium">Description</label>
              <textarea
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />

              <div className="flex gap-2 mb-4">
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value as any)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="TASK">Task</option>
                  <option value="FEATURE">Feature</option>
                  <option value="BUG">Bug</option>
                </select>

                <select
                  value={issuePriority}
                  onChange={(e) => setIssuePriority(e.target.value as any)}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {editingIssueId && (
                <div className="flex gap-2 mb-4">
                  <select
                    value={issueStatus}
                    onChange={(e) => setIssueStatus(e.target.value as any)}
                    className="flex-1 p-2 border rounded"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleIssueModalSubmit}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  {editingIssueId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
