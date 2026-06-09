'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EditProfile() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', bio: '', links: [] });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let avatarUrl, bannerUrl;
    if (avatarFile) avatarUrl = await uploadFile(avatarFile);
    if (bannerFile) bannerUrl = await uploadFile(bannerFile);

    await fetch('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ ...form, avatarUrl, bannerUrl }),
      headers: { 'Content-Type': 'application/json' },
    });
    router.push('/profile/me');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 space-y-4">
      <div>
        <label>Avatar</label>
        <input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
      </div>
      <div>
        <label>Banner</label>
        <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} />
      </div>
      <div>
        <label>Name</label>
        <input className="border p-2 w-full" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label>Bio</label>
        <textarea className="border p-2 w-full" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}