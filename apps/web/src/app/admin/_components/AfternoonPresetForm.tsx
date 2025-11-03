'use client';
import { useFormState, useFormStatus } from 'react-dom';

import { initialStandFormState, updateAfternoonPresetAction } from '@/server/actions/stand';

type PresetEntry = {
  standId: number;
  label: string;
  zoneLabel: string;
  enabled: boolean;
  disabled: boolean;
};

type AfternoonPresetFormProps = {
  presetType: string;
  title: string;
  description: string;
  entries: PresetEntry[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? 'Saving…' : 'Save Preset'}
    </button>
  );
}

export function AfternoonPresetForm({
  presetType,
  title,
  description,
  entries
}: AfternoonPresetFormProps) {
  const [state, action] = useFormState(updateAfternoonPresetAction, initialStandFormState);

  return (
    <form
      action={action}
      className="flex h-full flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-5"
    >
      <input type="hidden" name="presetType" value={presetType} />

      <header className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-cyan-300">{presetType}</p>
        <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400">{description}</p>
      </header>

      <div className="max-h-72 overflow-y-auto pr-1">
        <div className="grid gap-2 sm:grid-cols-2">
          {entries.map((entry) => (
            <label
              key={entry.standId}
              className={`flex items-start gap-2 rounded-md border border-slate-800 px-3 py-2 text-sm transition ${
                entry.disabled ? 'opacity-60' : 'hover:border-cyan-400'
              }`}
            >
              <input
                type="checkbox"
                name="standIds"
                value={entry.standId}
                defaultChecked={entry.enabled}
                disabled={entry.disabled}
                className="mt-1 h-4 w-4 rounded border border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
              />
              <span className="flex flex-col">
                <span className="font-medium text-slate-100">{entry.label}</span>
                <span className="text-xs text-slate-400">{entry.zoneLabel}</span>
                {entry.disabled ? (
                  <span className="text-xs font-medium text-amber-400">Locked off</span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      </div>

      {state.error && <p className="text-sm text-rose-400">{state.error}</p>}
      {!state.error && state.success && (
        <p className="text-sm text-emerald-400">Preset saved.</p>
      )}

      <div className="mt-auto">
        <SubmitButton />
      </div>
    </form>
  );
}
