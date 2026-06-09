import { NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  const refreshToken = req.cookies.get('refreshToken')?.value;
  if (!refreshToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 403 });

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const newAccessToken = signAccessToken({ userId: user.id, username: user.username });
  const response = NextResponse.json({ success: true });
  response.cookies.set('accessToken', newAccessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 });
  return response;
}