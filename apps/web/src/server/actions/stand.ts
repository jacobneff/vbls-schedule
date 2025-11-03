'use server';

import { DayPresetType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

import { prisma } from '@/server/db';
import { afternoonPresetTypeLookup } from '@/lib/afternoonPresets';
import type { StandFormState } from './stand-state';

const presetTypeLookup = afternoonPresetTypeLookup;

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

export async function updateStandDoubleStaffedAction(formData: FormData) {
  const standIdRaw = formData.get('standId');
  const doubleStaffedRaw = formData.get('doubleStaffed');

  const standId = Number(standIdRaw);
  if (!Number.isInteger(standId)) {
    return;
  }

  const nextDoubleStaffed = parseBooleanFlag(doubleStaffedRaw);

  await prisma.stand.update({
    where: { id: standId },
    data: {
      doubleStaffed: nextDoubleStaffed
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
