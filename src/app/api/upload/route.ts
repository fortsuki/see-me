import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadToImgBB } from '@/lib/imgbb';

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('image') as File;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  // Validate file type and size
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Max 5MB' }, { status: 400 });

  const url = await uploadToImgBB(file);
  return NextResponse.json({ url });
}