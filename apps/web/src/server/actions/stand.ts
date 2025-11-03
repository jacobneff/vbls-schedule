'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/server/db';
import {
  parseStandFormData,
  normalizeStandInput,
  StandCreateInput,
  StandValidationError
} from '@/server/validation/stand';

export type StandFormState = {
  success: boolean;
  error?: string;
};

export const initialStandFormState: StandFormState = {
  success: false
};

export async function createStandAction(
  _prevState: StandFormState,
  formData: FormData
): Promise<StandFormState> {
  try {
    const payload = parseStandFormData(formData);
    await prisma.stand.create({
      data: payload
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: 'A stand with that label already exists.'
      };
    }

    if (error instanceof StandValidationError) {
      return { success: false, error: error.message };
    }

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Unknown error creating stand.' };
  }
}

export async function createStandViaApi(payload: StandCreateInput) {
  const data = normalizeStandInput(payload);
  return prisma.stand.create({ data });
}
