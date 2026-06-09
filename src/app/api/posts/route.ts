import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { imageUrl } = await req.json();
  if (!imageUrl) return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });

  const post = await prisma.post.create({
    data: { imageUrl, userId: user.id },
  });
  return NextResponse.json(post);
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { postId } = await req.json();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.post.delete({ where: { id: postId } });
  return NextResponse.json({ success: true });
}