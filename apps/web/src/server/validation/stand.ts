import { Zone } from '@prisma/client';

export type StandCreateInput = {
  label: string;
  zone: Zone;
  supportsAS: boolean;
  neverSupportsAS: boolean;
};

export class StandValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StandValidationError';
  }
}

const MAX_LABEL_LENGTH = 32;
const CRO_PATTERN = /^CRO\s*(\d+)$/i;
const LOCKED_NUMERIC_STANDS = new Set(['56', '57']);

function normalizeLabel(value: unknown): string {
  if (typeof value !== 'string') {
    throw new StandValidationError('Label is required.');
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw new StandValidationError('Label is required.');
  }

  if (trimmed.length > MAX_LABEL_LENGTH) {
    throw new StandValidationError(`Label must be ${MAX_LABEL_LENGTH} characters or fewer.`);
  }

  return trimmed;
}

function normalizeZone(value: unknown): Zone {
  if (typeof value !== 'string') {
    throw new StandValidationError('Zone is required.');
  }

  if (!Object.values(Zone).includes(value as Zone)) {
    throw new StandValidationError('Zone selection is invalid.');
  }

  return value as Zone;
}

function coerceSupportsAS(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'on' || normalized === 'yes';
  }

  return Boolean(value);
}

function deriveNeverSupportsAS(label: string): boolean {
  const trimmed = label.trim();
  const numeric = trimmed.replace(/\s+/g, '').toUpperCase();

  if (LOCKED_NUMERIC_STANDS.has(numeric)) {
    return true;
  }

  const croMatch = CRO_PATTERN.exec(trimmed);
  if (croMatch) {
    const standNumber = Number.parseInt(croMatch[1] ?? '', 10);
    if (!Number.isNaN(standNumber) && standNumber >= 1 && standNumber <= 6) {
      return true;
    }
  }

  return false;
}

export function normalizeStandInput(input: {
  label: unknown;
  zone: unknown;
  supportsAS: unknown;
}): StandCreateInput {
  const label = normalizeLabel(input.label);
  const zone = normalizeZone(input.zone);
  const neverSupportsAS = deriveNeverSupportsAS(label);
  const supportsAS = neverSupportsAS ? false : coerceSupportsAS(input.supportsAS);

  return {
    label,
    zone,
    supportsAS,
    neverSupportsAS
  };
}

/**
 * Parses form submission data into a strongly-typed stand payload.
 */
export function parseStandFormData(formData: FormData): StandCreateInput {
  return normalizeStandInput({
    label: formData.get('label'),
    zone: formData.get('zone'),
    supportsAS:
      formData.get('supportsAS') === 'on' ||
      formData.get('supportsAS') === 'true' ||
      formData.get('supportsAS') === '1'
  });
}
