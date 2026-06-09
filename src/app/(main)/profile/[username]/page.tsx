import { PostGrid } from '@/components/PostGrid';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default async function PublicProfile({ params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { links: true },
  });
  if (!user) notFound();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="relative h-48 bg-gray-200">
        {user.bannerUrl && <Image src={user.bannerUrl} alt="banner" fill className="object-cover" />}
      </div>
      <div className="flex justify-between items-end -mt-12 px-4">
        <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
          {user.avatarUrl && <Image src={user.avatarUrl} alt="avatar" width={96} height={96} />}
        </div>
      </div>
      <div className="mt-4">
        <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
        <p className="text-gray-600">@{user.username}</p>
        <p className="mt-2">{user.bio}</p>
        <div className="mt-4 space-y-1">
          {user.links.map(link => (
            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block text-blue-500">
              {link.title || link.url}
            </a>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        <PostGrid userId={user.id} isOwner={false} />
      </div>
    </div>
  );
}