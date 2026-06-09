import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rateLimit';

export async function GET(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;

  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 });

  // Rate limit 30 searches per minute per user
  const allowed = await checkRateLimit(`search:${user.id}`, 30, 1);
  if (!allowed) return NextResponse.json({ error: 'Too many searches' }, { status: 429 });

  const users = await prisma.user.findMany({
    where: { username: { contains: query, mode: 'insensitive' } },
    select: { username: true, name: true, avatarUrl: true },
    take: limit,
    skip: (page - 1) * limit,
  });

  return NextResponse.json(users);
}