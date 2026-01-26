'use client';

import { useEffect, useState } from 'react';
import api from '../lib/axios';

export default function CommentList({ issueId }: { issueId: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = () => {
    api.get(`/comments/issue/${issueId}`).then(res => setComments(res.data));
  };

  useEffect(() => {
    fetchComments();
  }, [issueId]);

  const handleAddComment = async () => {
    if (!newComment) return;
    await api.post(`/comments`, { issueId, content: newComment });
    setNewComment('');
    fetchComments();
  };

  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Comments</h3>
      {comments.map(c => (
        <div key={c.id} className="border-b py-2">
          <strong>{c.user.name}:</strong> {c.content}
        </div>
      ))}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          className="border rounded p-1 flex-1"
          placeholder="Add a comment"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 rounded"
          onClick={handleAddComment}
        >
          Send
        </button>
      </div>
    </div>
  );
}
