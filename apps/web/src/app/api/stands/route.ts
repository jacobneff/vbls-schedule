import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import { prisma } from '@/server/db';
import { normalizeStandInput, StandValidationError } from '@/server/validation/stand';

export async function GET() {
  const stands = await prisma.stand.findMany({
    orderBy: [
      { zone: 'asc' },
      { label: 'asc' }
    ]
  });

  return NextResponse.json(stands);
}

export async function POST(request: Request) {
  const payload = await request.json();

  try {
    const data = normalizeStandInput(payload);
    const stand = await prisma.stand.create({ data });
    return NextResponse.json(stand, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A stand with that label already exists.' },
        { status: 409 }
      );
    }

    if (error instanceof StandValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Unexpected error creating stand.' }, { status: 500 });
  }
}
