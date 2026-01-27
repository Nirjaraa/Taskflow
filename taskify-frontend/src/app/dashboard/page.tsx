'use client';

import DashboardLayout from './../components/DashboardLayout';
import AuthGuard from './../components/AuthGuard';
import { useEffect, useState } from 'react';
import { getDashboard } from './../lib/auth';
import { useRouter } from 'next/navigation';

interface PendingInvite {
  id: number;
  workspaceId: number;
  workspaceName: string;
}

interface Project {
  id: number;
  name: string;
  workspaceId: number;
  workspace: { id: number; name: string };
}

interface Issue {
  id: number;
  title: string;
  projectId: number;
  project: { id: number; name: string };
  workspaceId: number;
}

interface Comment {
  id: number;
  content: string;
  issueId: number;
  issue: { id: number; title: string; project: { id: number; name: string } };
  workspaceId: number;
  projectId: number;
}

interface DashboardData {
  pendingInvites: PendingInvite[];
  projects: Project[];
  issues: Issue[];
  comments: Comment[];
}

const EMPTY_DASHBOARD: DashboardData = {
  pendingInvites: [],
  projects: [],
  issues: [],
  comments: [],
};

const DISPLAY_LIMIT = 5;

export default function DashboardPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboard();
        setDashboard({ ...EMPTY_DASHBOARD, ...data });
      } catch {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const openModal = (title: string, items: React.ReactNode[]) => {
    setModalTitle(title);
    setModalItems(items);
    setModalOpen(true);
  };

  const handleItemClick = (type: string, workspaceId: number, projectId?: number) => {
    if (type === 'invite') router.push(`/workspaces/${workspaceId}`);
    else if (type === 'project') router.push(`/workspaces/${workspaceId}/${projectId}`);
    else if (type === 'issue' || type === 'comment') router.push(`/workspaces/${workspaceId}/${projectId}`);
  };

  const renderColumn = <T extends { id: number }>(
    title: string,
    items: T[],
    color: string,
    renderItem: (item: T) => React.ReactNode
  ) => {
    const showAll = items.length > DISPLAY_LIMIT;
    const displayedItems = showAll ? items.slice(0, DISPLAY_LIMIT) : items;

    return (
      <div
        className={`bg-${color}-50 border-l-4 border-${color}-400 p-4 rounded shadow w-80 flex-shrink-0`}
      >
        <h2 className="font-bold text-lg mb-2">{title}</h2>
        <div className="space-y-2">
          {displayedItems.map((item) => (
            <div
              key={item.id}
              className={`bg-${color}-100 p-3 rounded shadow-sm break-words cursor-pointer hover:bg-${color}-200`}
              onClick={() => {
                if ('workspaceId' in item && !('projectId' in item)) handleItemClick('invite', (item as unknown as PendingInvite).workspaceId);
                else if ('workspaceId' in item && 'projectId' in item && 'name' in item) handleItemClick('project', (item as unknown as Project).workspaceId, (item as unknown as Project).id);
                else if ('workspaceId' in item && 'projectId' in item && 'title' in item) handleItemClick('issue', (item as unknown as Issue).workspaceId, (item as unknown as Issue).projectId);
              }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
        {showAll && (
          <button
            className="mt-2 text-sm text-blue-600 hover:underline"
            onClick={() =>
              openModal(
                title,
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-${color}-100 p-3 rounded shadow-sm mb-2 cursor-pointer hover:bg-${color}-200`}
                    onClick={() => {
                      if ('workspaceId' in item && !('projectId' in item)) handleItemClick('invite', (item as unknown as PendingInvite).workspaceId);
                      else if ('workspaceId' in item && 'projectId' in item && 'name' in item) handleItemClick('project', (item as unknown as Project).workspaceId, (item as unknown as Project).id);
                      else if ('workspaceId' in item && 'projectId' in item && 'title' in item) handleItemClick('issue', (item as unknown as Issue).workspaceId, (item as unknown as Issue).projectId);
                    }}
                  >
                    {renderItem(item)}
                  </div>
                ))
              )
            }
          >
            Load more...
          </button>
        )}
      </div>
    );
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <AuthGuard>
      <div className={modalOpen ? 'filter blur-sm transition-all' : ''}>
        <DashboardLayout>
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {renderColumn<PendingInvite>(
              'Pending Invites',
              dashboard.pendingInvites,
              'blue',
              (invite) => invite.workspaceName
            )}

            {renderColumn<Project>(
              'Projects',
              dashboard.projects,
              'green',
              (project) => `${project.name} (${project.workspace.name})`
            )}

            {renderColumn<Issue>(
              'Issues',
              dashboard.issues,
              'purple',
              (issue) => (
                <>
                  <div className="font-semibold">{issue.title}</div>
                  <div className="text-sm text-gray-700">Project: {issue.project.name}</div>
                </>
              )
            )}

            {renderColumn<Comment>(
              'Comments',
              dashboard.comments,
              'gray',
              (comment) => (
                <>
                  <div>{comment.content}</div>
                  <div className="text-sm text-gray-700">
                    Issue: {comment.issue.title} <br />
                    Project: {comment.issue.project.name}
                  </div>
                </>
              )
            )}
          </div>
        </DashboardLayout>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg w-11/12 max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{modalTitle}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto space-y-2">{modalItems}</div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
