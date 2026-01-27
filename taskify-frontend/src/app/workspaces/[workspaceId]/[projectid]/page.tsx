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
} from '../../../lib/auth';
import { ChevronDown, ChevronUp, Trash2, Edit, Plus, X } from 'lucide-react';

// Optional simple toast component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 bg-red-100 text-red-700 px-4 py-2 rounded shadow flex items-center gap-2">
    <span>{message}</span>
    <button onClick={onClose}><X size={16} /></button>
  </div>
);

// Helper to normalize useParams to string
const toStringParam = (p: string | string[] | undefined) =>
  Array.isArray(p) ? p[0] : p || '';

export default function ProjectDetailPage() {
  const { workspaceId, projectid } = useParams();
  const router = useRouter();

  const wsId = toStringParam(workspaceId);
  const projId = toStringParam(projectid);

  // Guard against missing params
  if (!wsId || !projId) return <div className="p-8 text-red-600">Invalid URL</div>;

  const [project, setProject] = useState<any>(null);
  const [sprints, setSprints] = useState<any[]>([]);
  const [showSprints, setShowSprints] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalValue, setModalValue] = useState('');
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);

  // ---------- Fetch project & sprints ----------
  useEffect(() => {
    const fetchData = async () => {
      loadToken();

      try {
        const projectRes = await getProject(wsId, projId);
        setProject(projectRes);
        setIsAdmin(projectRes.role === 'ADMIN'); // adjust according to your API
      } catch (err: any) {
        console.error('Project load failed:', err);
        router.replace(`/workspaces/${wsId}`);
        return;
      }

      try {
        const sprintsRes = await listSprints(projId);
        setSprints(sprintsRes);
      } catch (err: any) {
        console.error('Sprints load failed:', err);
        setToast('Failed to load sprints');
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

  const handleOpenModal = (sprintId?: string, name?: string) => {
    setEditingSprintId(sprintId || null);
    setModalValue(name || '');
    setModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!modalValue.trim()) return;
    try {
      if (editingSprintId) {
        // Update sprint
        await updateSprint(editingSprintId, { name: modalValue });
        setSprints(
          sprints.map((s) => (s.id === editingSprintId ? { ...s, name: modalValue } : s))
        );
      } else {
        // Create sprint
        const newSprint = await createSprint(projId, { name: modalValue });
        setSprints([...sprints, newSprint]);
      }
      setModalOpen(false);
      setModalValue('');
      setEditingSprintId(null);
    } catch (err: any) {
      console.error(err);
      setToast(err.response?.data?.message || 'Failed to save sprint');
    }
  };

  if (loading) return <div className="p-8">Loading project...</div>;
  if (!project) return <div className="p-8">Project not found</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-700">{project.name}</h1>
          <div className="flex space-x-2">
            {isAdmin && (
              <button
                onClick={handleDeleteProject}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
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

        {project.description && <p className="text-gray-600">{project.description}</p>}

        {/* Sprints */}
        <div className="bg-white rounded-lg shadow p-4">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowSprints(!showSprints)}
          >
            <h2 className="text-xl font-semibold text-purple-700">Sprints</h2>
            {showSprints ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showSprints && (
            <div className="mt-4 space-y-3">
              {sprints.length === 0 ? (
                <p className="text-gray-500 text-sm">No sprints yet.</p>
              ) : (
                sprints.map((s) => (
                  <div
                    key={s.id}
                    className="border p-3 rounded hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-medium">{s.name}</span>
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-sm font-medium ${
                          s.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : s.status === 'COMPLETED'
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(s.id, s.name)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSprint(s.id)}
                          className="text-red-600 hover:text-red-800"
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
                  onClick={() => handleOpenModal()}
                  className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 flex items-center gap-2"
                >
                  <Plus size={16} /> Add Sprint
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-80">
            <h3 className="text-lg font-semibold mb-2">
              {editingSprintId ? 'Edit Sprint' : 'Create Sprint'}
            </h3>
            <input
              type="text"
              className="w-full border px-2 py-1 rounded mb-4"
              value={modalValue}
              onChange={(e) => setModalValue(e.target.value)}
              placeholder="Sprint name"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
