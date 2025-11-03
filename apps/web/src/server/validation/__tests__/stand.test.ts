import { describe, expect, it } from 'vitest';
import { Zone } from '@prisma/client';

import {
  parseStandFormData,
  normalizeStandInput,
  StandValidationError
} from '@/server/validation/stand';

describe('stand validation', () => {
  it('parses a valid form submission', () => {
    const formData = new FormData();
    formData.set('label', ' 16 ');
    formData.set('zone', Zone.RESORT_MIDDLE);
    formData.set('supportsAS', 'on');

    const result = parseStandFormData(formData);

    expect(result).toEqual({
      label: '16',
      zone: Zone.RESORT_MIDDLE,
      supportsAS: true,
      neverSupportsAS: false
    });
  });

  it('rejects an invalid zone', () => {
    const formData = new FormData();
    formData.set('label', 'Test');
    formData.set('zone', 'NOT_A_ZONE');

    expect(() => parseStandFormData(formData)).toThrowError();
  });

  it('requires label to be present', () => {
    expect(() =>
      normalizeStandInput({
        label: '',
        zone: Zone.CROATAN,
        supportsAS: false
      })
    ).toThrowError(StandValidationError);
  });

  it('forces afternoon shift off for Cro stands', () => {
    const result = normalizeStandInput({
      label: 'Cro 4',
      zone: Zone.CROATAN,
      supportsAS: true
    });

    expect(result).toEqual({
      label: 'Cro 4',
      zone: Zone.CROATAN,
      supportsAS: false,
      neverSupportsAS: true
    });
  });

  it('locks afternoon shift off for stand 56 regardless of input', () => {
    const result = normalizeStandInput({
      label: '56',
      zone: Zone.FIFTY_SEVENTH,
      supportsAS: true
    });

    expect(result).toEqual({
      label: '56',
      zone: Zone.FIFTY_SEVENTH,
      supportsAS: false,
      neverSupportsAS: true
    });
  });
});
