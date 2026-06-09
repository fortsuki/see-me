import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export type AccessTokenPayload = { userId: string; username: string };
export type RefreshTokenPayload = { userId: string };

export const signAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

export const signRefreshToken = (payload: RefreshTokenPayload) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try { return jwt.verify(token, JWT_SECRET) as AccessTokenPayload; }
  catch { return null; }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try { return jwt.verify(token, JWT_SECRET) as RefreshTokenPayload; }
  catch { return null; }
};