import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/bcrypt';
import { validateEmail, validateUsername, validatePassword } from '@/lib/validation';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

export async function POST(req: Request) {
  const { email, username, password } = await req.json();

  // Input validation
  if (!validateEmail(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!validateUsername(username)) return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
  if (!validatePassword(password)) return NextResponse.json({ error: 'Weak password' }, { status: 400 });

  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (exists) return NextResponse.json({ error: 'Email or username taken' }, { status: 409 });

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, username, passwordHash } });

  const accessToken = signAccessToken({ userId: user.id, username: user.username });
  const refreshToken = signRefreshToken({ userId: user.id });

  const response = NextResponse.json({ success: true });
  response.cookies.set('accessToken', accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 });
  response.cookies.set('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 3600 });
  return response;
}