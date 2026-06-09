import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sanitize } from '@/lib/sanitize';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const username = url.searchParams.get('username');
  if (!username) return NextResponse.json({ error: 'Missing username' }, { status: 400 });

  const user = await prisma.user.findUnique({
    where: { username },
    select: { username: true, name: true, bio: true, avatarUrl: true, bannerUrl: true, links: true, posts: true }
  });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();
  const { name, bio, links, avatarUrl, bannerUrl } = data;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: sanitize(name),
      bio: sanitize(bio),
      avatarUrl,
      bannerUrl,
      links: {
        deleteMany: {},
        create: links?.map((link: any) => ({ url: sanitize(link.url), title: sanitize(link.title) })) || []
      }
    }
  });
  return NextResponse.json(updated);
}