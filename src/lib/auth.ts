import { verifyAccessToken } from './jwt';
import prisma from './prisma';

export async function getCurrentUser(request: Request) {
  const token = request.cookies.get('accessToken')?.value;
  if (!token) return null;
  const payload = verifyAccessToken(token);
  if (!payload) return null;
  return await prisma.user.findUnique({ where: { id: payload.userId } });
}