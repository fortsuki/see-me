import prisma from './prisma';

export async function checkRateLimit(key: string, max: number, windowMinutes: number): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMinutes * 60000);

  const record = await prisma.rateLimit.findUnique({ where: { key } });

  if (!record) {
    await prisma.rateLimit.create({ data: { key, count: 1, expiresAt } });
    return true;
  }

  if (record.expiresAt < now) {
    await prisma.rateLimit.update({ where: { key }, data: { count: 1, expiresAt } });
    return true;
  }

  if (record.count >= max) return false;

  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}