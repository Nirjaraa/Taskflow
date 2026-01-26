'use client';

import React from 'react';

interface IssueCardProps {
  issue: {
    id: number;
    title: string;
    status: string;
    priority: string;
  };
}

export default function IssueCard({ issue }: IssueCardProps) {
  return (
    <div className="p-4 border rounded-md hover:shadow-md">
      <h3 className="font-semibold">{issue.title}</h3>
      <p>Status: {issue.status}</p>
      <p>Priority: {issue.priority}</p>
    </div>
  );
}
