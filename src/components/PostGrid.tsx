'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function PostGrid({ userId, isOwner }: { userId: string; isOwner: boolean }) {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const res = await fetch(`/api/posts?userId=${userId}`);
    const data = await res.json();
    setPosts(data);
  };

  const handleDelete = async (postId: string) => {
    await fetch('/api/posts', { method: 'DELETE', body: JSON.stringify({ postId }), headers: { 'Content-Type': 'application/json' } });
    fetchPosts();
  };

  useEffect(() => { fetchPosts(); }, [userId]);

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post: any) => (
        <div key={post.id} className="relative aspect-square">
          <Image src={post.imageUrl} alt="post" fill className="object-cover" />
          {isOwner && (
            <button onClick={() => handleDelete(post.id)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded">
              🗑️
            </button>
          )}
        </div>
      ))}
    </div>
  );
}