import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword } from '@/lib/bcrypt';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const { email, password } = await req.json();

  // Rate limiting by IP
  const allowed = await checkRateLimit(`login:${ip}`, 5, 15);
  if (!allowed) return NextResponse.json({ error: 'Too many attempts, try later' }, { status: 429 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    await prisma.loginAttempt.create({ data: { ip, email, success: false } });
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  await prisma.loginAttempt.create({ data: { ip, email, success: true } });

  const accessToken = signAccessToken({ userId: user.id, username: user.username });
  const refreshToken = signRefreshToken({ userId: user.id });

  const response = NextResponse.json({ success: true });
  response.cookies.set('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 });
  response.cookies.set('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 3600 });
  return response;
}