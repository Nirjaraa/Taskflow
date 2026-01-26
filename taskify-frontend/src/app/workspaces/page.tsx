'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { listWorkspaces, createWorkspace, inviteMember } from '../lib/auth';

type Workspace = {
  id: number;
  name: string;
  role: 'ADMIN' | 'MEMBER'|'GUEST'|null;
};

type Invite = { email: string; role: 'ADMIN' | 'MEMBER' | 'GUEST' };

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');
  const [invites, setInvites] = useState<Invite[]>([]);

  const loadWorkspaces = async () => {
    const res = await listWorkspaces();
    // Only show workspace name + role of current user
    setWorkspaces(res.data);
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const addInviteField = () =>
    setInvites([...invites, { email: '', role: 'GUEST' }]);

  const updateInviteField = (
    i: number,
    key: 'email' | 'role',
    value: string
  ) => {
    const copy = [...invites];
    copy[i][key] = value as any;
    setInvites(copy);
  };

  const removeInviteField = (i: number) => {
    const copy = [...invites];
    copy.splice(i, 1);
    setInvites(copy);
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName || !workspaceSlug) {
      return alert('Workspace name and URL slug are required.');
    }

    const wsRes = await createWorkspace({
      name: workspaceName,
      urlSlug: workspaceSlug,
    });
    const wsId = wsRes.data.id;

    for (let inv of invites) {
      if (inv.email) {
        await inviteMember(wsId, inv);
      }
    }

    setWorkspaceName('');
    setWorkspaceSlug('');
    setInvites([]);
    setShowCreate(false);
    loadWorkspaces();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8">
        {/* ---------- Header ---------- */}
        <h1 className="text-4xl font-bold text-purple-700 mb-4">
          Your Workspaces
        </h1>
        <p className="text-gray-600 mb-6">
          Here are all workspaces you own or are a member of.
        </p>

        {/* ---------- Workspace List ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map(ws => (
            <div
              key={ws.id}
              className="bg-white rounded-lg shadow hover:shadow-lg border border-gray-200 p-5 flex justify-between items-center transition"
            >
              <div>
                <h2 className="font-semibold text-lg text-purple-700">
                  {ws.name}
                </h2>
                <p className="text-gray-500 text-sm">Role: {ws.role}</p>
              </div>
              <a
                href={`/workspaces/${ws.id}`}
                className="text-purple-600 font-semibold hover:underline"
              >
                Open →
              </a>
            </div>
          ))}
        </div>

        {/* ---------- Create Workspace Section ---------- */}
        <div className="mt-8">
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 text-purple-700 font-bold text-lg hover:text-purple-800"
          >
            <span className="text-2xl">+</span> Create New Workspace
          </button>
{showCreate && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
      <button
        onClick={() => setShowCreate(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
      <h2 className="text-2xl font-bold text-purple-700 mb-4">Create Workspace</h2>

      <input
        type="text"
        placeholder="Workspace Name"
        value={workspaceName}
        onChange={e => setWorkspaceName(e.target.value)}
        className="border rounded p-2 w-full mb-2 focus:ring-2 focus:ring-purple-400"
      />

      <input
        type="text"
        placeholder="Workspace URL Slug (unique)"
        value={workspaceSlug}
        onChange={e => setWorkspaceSlug(e.target.value)}
        className="border rounded p-2 w-full mb-2 focus:ring-2 focus:ring-purple-400"
      />

      <div>
        <h3 className="font-semibold mb-2">Invite Members</h3>
        <div className="space-y-2">
  {invites.map((inv, i) => (
    <div key={i} className="flex gap-2 items-center">
      <input
        type="email"
        placeholder="Email"
        value={inv.email}
        onChange={e => updateInviteField(i, 'email', e.target.value)}
        className="border p-2 rounded flex-1 focus:ring-2 focus:ring-purple-400"
      />
      <select
        value={inv.role}
        onChange={e => updateInviteField(i, 'role', e.target.value)}
        className="border p-2 rounded focus:ring-2 focus:ring-purple-400"
      >
        <option value="GUEST">Guest</option>
        <option value="MEMBER">Member</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        onClick={() => removeInviteField(i)}
        className="text-red-500 font-bold"
      >
        ✕
      </button>
    </div>
  ))}

  <button
    onClick={addInviteField}
    className="text-purple-700 font-semibold hover:text-purple-800"
  >
    + Add Invite
  </button>
</div>

      <button
        onClick={handleCreateWorkspace}
        className="mt-4 w-full bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700 font-semibold"
      >
        Save Workspace
      </button>
    </div>
    </div>
  </div>
)}


         
        </div>
      </main>
    </div>
  );
}
