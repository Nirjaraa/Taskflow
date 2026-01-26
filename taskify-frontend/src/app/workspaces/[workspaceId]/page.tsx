'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import {
  listMembers,
  inviteMember,
  updateMemberRole,
  listProjects,
  loadToken,
  getMe,
} from '../../lib/auth';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';  

export default function WorkspaceDetailPage() {
  const { workspaceId } = useParams();
  const id = Number(workspaceId);

  const [confirm, setConfirm] = useState<any>(null);
  const [currentUserRole, setCurrentUserRole] = useState<'ADMIN' | 'MEMBER' | 'GUEST'>('MEMBER');
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER' | 'GUEST'>('MEMBER');
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: number; newRole: 'ADMIN'|'MEMBER'|'GUEST'} | null>(null);
  const [membersExpanded, setMembersExpanded] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Trigger confirm modal when a role change is selected
  useEffect(() => {
    if (pendingRoleChange) {
      const targetMember = members.find(m => (m.user?.id ?? m.userId) === pendingRoleChange.userId);
      if (!targetMember || targetMember.status === 'PENDING') {
        alert('Cannot change role of a pending member.');
        setPendingRoleChange(null);
        return;
      }

      setConfirm({
        title: 'Change Role',
        description: `Change role of ${targetMember.user?.email ?? 'User'} to ${pendingRoleChange.newRole}?`,
        action: async () => {
          await handleRoleUpdate(pendingRoleChange.userId, pendingRoleChange.newRole);
          setPendingRoleChange(null);
        },
      });
    }
  }, [pendingRoleChange, members]);

  // Load members
  const loadMembers = async () => {
    try {
      const res = await listMembers(id);
      setMembers(res.data);

      const meRes = await getMe();
      const currentUserId = meRes.data.id;

      const meMember = res.data.find((m: any) => m.user?.id === currentUserId);
      if (meMember) setCurrentUserRole(meMember.role);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  // Load projects
  const loadProjects = async () => {
    try {
      const res = await listProjects(id);
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    loadToken();
    loadMembers();
    loadProjects();
  }, [id]);

  // Invite new member
  const handleInvite = async () => {
    try {
      await inviteMember(id, { email, role });
      setEmail('');
      setRole('MEMBER');
      setInviteOpen(false);
      await loadMembers();
    } catch (err) {
      console.error('Failed to invite member:', err);
    }
  };

  // Update member role
  const handleRoleUpdate = async (userId: number, newRole: 'ADMIN' | 'MEMBER' | 'GUEST') => {
    setMembers(prev =>
      prev.map(m => (m.user?.id ?? m.userId) === userId ? { ...m, role: newRole } : m)
    );

    try {
      await updateMemberRole(id, userId, newRole);
      await loadMembers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update role');
      await loadMembers(); // rollback
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-4">
          Workspace #{id}
        </h1>

        {/* Projects */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg border">
                <h3 className="font-semibold text-lg text-purple-700">{p.name}</h3>
                <p className="text-gray-500 text-sm">{p.description || 'No description'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold mb-2">Members</h2>
            <button
              className="flex items-center gap-1 text-purple-600 font-medium"
              onClick={() => setMembersExpanded(!membersExpanded)}
            >
              {membersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {membersExpanded ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Invite Section */}
          {currentUserRole === 'ADMIN' && (
            <div className="mb-4">
              {inviteOpen ? (
                <div className="bg-white p-4 rounded-lg shadow flex gap-2 items-center">
                  <input
                    className="border p-2 rounded flex-1"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as 'ADMIN' | 'MEMBER' | 'GUEST')}
                    className="border p-2 rounded"
                  >
                    <option value="GUEST">Guest</option>
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    onClick={handleInvite}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setInviteOpen(false)}
                    className="px-3 py-1 rounded border"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setInviteOpen(true)}
                  className="flex items-center gap-1 text-purple-600 font-medium mb-2"
                >
                  <Plus size={16} /> Add Invite
                </button>
              )}
            </div>
          )}

          {/* Members list */}
          {membersExpanded && (
            <div className="space-y-2">
              {members.map(m => {
                const userId = m.user?.id ?? m.userId;
                const isPending = m.status === 'PENDING';
                const canEdit = currentUserRole === 'ADMIN' && !isPending;

                return (
                  <div
                    key={userId}
                    className="bg-white p-3 rounded-lg shadow flex justify-between items-center"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{m.user?.email ?? `User #${userId}`}</span>

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 rounded text-sm font-medium ${
                            isPending ? 'bg-yellow-500 text-white' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {isPending ? 'Pending' : 'Active'}
                        </span>
                        <span className="ml-2 font-bold text-purple-600">{m.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <select
                          value={m.role}
                          onChange={e =>
                            setPendingRoleChange({ userId, newRole: e.target.value as any })
                          }
                          className="border p-2 rounded"
                        >
                          <option value="GUEST">Guest</option>
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                      {!canEdit && currentUserRole !== 'ADMIN' && (
                        <span className="text-gray-400 text-sm">Admins only</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm Modal */}
        <ConfirmModal
          open={!!confirm}
          title={confirm?.title}
          description={confirm?.description}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            confirm?.action();
            setConfirm(null);
          }}
        />
      </main>
    </div>
  );
}
