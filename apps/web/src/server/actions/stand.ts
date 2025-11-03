'use server';

import { Prisma, DayPresetType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/server/db';
import {
  parseStandFormData,
  normalizeStandInput,
  StandCreateInput,
  StandValidationError
} from '@/server/validation/stand';
import {
  afternoonPresetTypeLookup,
  afternoonPresetTypes
} from '@/lib/afternoonPresets';

export type StandFormState = {
  success: boolean;
  error?: string;
};

export const initialStandFormState: StandFormState = {
  success: false
};

const presetTypeLookup = afternoonPresetTypeLookup;

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

function parseBooleanFlag(value: FormDataEntryValue | null): boolean {
  if (typeof value === 'string') {
    return value === 'true' || value === '1' || value === 'on';
  }
  return Boolean(value);
}

export async function updateStandAfternoonAction(formData: FormData) {
  const standIdRaw = formData.get('standId');
  const supportsRaw = formData.get('supportsAS');

  const standId = Number(standIdRaw);
  if (!Number.isInteger(standId)) {
    return;
  }

  const nextSupports = parseBooleanFlag(supportsRaw);

  const stand = await prisma.stand.findUnique({
    where: { id: standId },
    select: { id: true, neverSupportsAS: true }
  });

  if (!stand || stand.neverSupportsAS) {
    return;
  }

  await prisma.stand.update({
    where: { id: standId },
    data: {
      supportsAS: nextSupports
    }
  });

  revalidatePath('/admin');
}

export async function updateAfternoonPresetAction(
  _prevState: StandFormState,
  formData: FormData
): Promise<StandFormState> {
  const presetTypeRaw = formData.get('presetType');

  if (typeof presetTypeRaw !== 'string' || !presetTypeLookup.has(presetTypeRaw as DayPresetType)) {
    return { success: false, error: 'Invalid preset selection.' };
  }

  const presetType = presetTypeRaw as DayPresetType;
  const enabledStandIds = new Set(
    formData
      .getAll('standIds')
      .map((value) => Number(value))
      .filter((id) => Number.isInteger(id))
  );

  try {
    const [stands, preset] = await Promise.all([
      prisma.stand.findMany({
        select: { id: true, neverSupportsAS: true }
      }),
      prisma.afternoonPreset.upsert({
        where: { presetType },
        update: {},
        create: { presetType }
      })
    ]);

    await prisma.$transaction(
      stands.map((stand) => {
        const enabled = !stand.neverSupportsAS && enabledStandIds.has(stand.id);
        return prisma.afternoonPresetEntry.upsert({
          where: {
            stand_preset_unique: {
              standId: stand.id,
              presetId: preset.id
            }
          },
          update: { enabled },
          create: {
            standId: stand.id,
            presetId: preset.id,
            enabled
          }
        });
      })
    );

    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Unknown error updating preset.' };
  }
}
