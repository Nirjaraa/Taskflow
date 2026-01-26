'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../../lib/axios';
import IssueCard from '../../../../components/IssueCard';
import CommentList from '../../../../components/CommentList';
import Sidebar from '../../../../components/Sidebar';
import Topbar from '../../../../components/Navbar';
import AuthGuard from '../../../../components/AuthGuard';

export default function ProjectPage() {
  const { workspaceId, projectId } = useParams();
  const [issues, setIssues] = useState<any[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/api/projects/${projectId}/issues`).then(res => setIssues(res.data));
  }, [projectId]);

  return (
    <AuthGuard>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-6">
            <h1 className="text-2xl font-bold mb-4">Issues</h1>
            <div className="grid grid-cols-1 gap-4">
              {issues.map(issue => (
                <div
                  key={issue.id}
                  className="p-4 border rounded-lg hover:shadow-md cursor-pointer"
                  onClick={() => setSelectedIssueId(String(issue.id))}
                >
                  <IssueCard issue={issue} />
                </div>
              ))}
            </div>

            {selectedIssueId && (
              <div className="mt-6">
                <CommentList issueId={selectedIssueId} />
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
