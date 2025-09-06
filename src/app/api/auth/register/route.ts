import { NextRequest } from 'next/server';
import { AuthController } from '@/modules/auth/controller';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return await AuthController.register(request);
}
