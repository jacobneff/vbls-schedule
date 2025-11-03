'use client';

import { useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

import { createStandAction, initialStandFormState } from '@/server/actions/stand';

type ZoneOption = {
  value: string;
  label: string;
};

type CreateStandFormProps = {
  zoneOptions: ZoneOption[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Saving…' : 'Add Stand'}
    </button>
  );
}

export function CreateStandForm({ zoneOptions }: CreateStandFormProps) {
  const [state, action] = useFormState(createStandAction, initialStandFormState);

  const options = useMemo(() => zoneOptions, [zoneOptions]);

  return (
    <form action={action} className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-6">
      <div>
        <h2 className="text-lg font-semibold text-cyan-200">Stands & Zones</h2>
        <p className="mt-1 text-sm text-slate-400">
          Create new stands and map them to their zone. Afternoon shift support determines if they
          appear in AS patterns.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-200">Stand Label</span>
          <input
            name="label"
            required
            placeholder="e.g. 16 or Cro 2"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-slate-200">Zone</span>
          <select
            name="zone"
            required
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          >
            <option value="">Select a zone</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          name="supportsAS"
          className="h-4 w-4 rounded border border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
        />
        Supports Afternoon Shift (AS)
      </label>

      {state.error && <p className="text-sm text-rose-400">{state.error}</p>}
      {state.success && !state.error && (
        <p className="text-sm text-emerald-400">Stand created successfully.</p>
      )}

      <SubmitButton />
    </form>
  );
}
