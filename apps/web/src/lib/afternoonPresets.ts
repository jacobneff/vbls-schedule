import { DayPresetType } from '@prisma/client';

const FALLBACK_PRESET_TYPES = [
  'WEEKDAY',
  'WEEKEND',
  'MEMORIAL_DAY',
  'INDEPENDENCE_DAY',
  'LABOR_DAY'
] as const;

const resolvedPresetTypes =
  DayPresetType && typeof DayPresetType === 'object'
    ? (Object.values(DayPresetType) as DayPresetType[])
    : (FALLBACK_PRESET_TYPES as unknown as DayPresetType[]);

export const afternoonPresetTypes = resolvedPresetTypes;

export const afternoonPresetTypeLookup = new Set(resolvedPresetTypes);
