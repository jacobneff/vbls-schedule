import { NextResponse } from 'next/server';

import { prisma } from '@/server/db';

export async function GET() {
  const stands = await prisma.stand.findMany({
    orderBy: [
      { zone: 'asc' },
      { label: 'asc' }
    ]
  });

  return NextResponse.json(stands);
}

export function POST() {
  return NextResponse.json(
    { error: 'Stand creation is disabled. Manage stands directly in the database if needed.' },
    { status: 405 }
  );
}
