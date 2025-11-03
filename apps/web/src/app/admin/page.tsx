import { DayPresetType, Zone } from '@prisma/client';

import { CreateStandForm } from './_components/CreateStandForm';
import { AfternoonPresetForm } from './_components/AfternoonPresetForm';
import { prisma } from '@/server/db';
import { updateStandAfternoonAction } from '@/server/actions/stand';
import { afternoonPresetTypes } from '@/lib/afternoonPresets';

export const metadata = {
  title: 'VBLS Admin — Scheduler Controls'
};

const zoneLabels: Record<Zone, string> = {
  [Zone.CROATAN]: 'Croatan Beach',
  [Zone.RESORT_SOUTH]: 'Resort — South (2–14)',
  [Zone.RESORT_MIDDLE]: 'Resort — Middle (15–28)',
  [Zone.RESORT_NORTH]: 'Resort — North (29–42)',
  [Zone.FIFTY_SEVENTH]: '57th Street'
};

const presetDetails: Record<
  DayPresetType,
  { title: string; description: string }
> = {
  [DayPresetType.WEEKDAY]: {
    title: 'Weekday Default',
    description: 'Applied Monday–Friday unless a holiday preset overrides it.'
  },
  [DayPresetType.WEEKEND]: {
    title: 'Weekend Default',
    description: 'Baseline for Saturdays and Sundays during the season.'
  },
  [DayPresetType.MEMORIAL_DAY]: {
    title: 'Memorial Day',
    description: 'Overrides weekday/weekend defaults on Memorial Day.'
  },
  [DayPresetType.INDEPENDENCE_DAY]: {
    title: 'Fourth of July',
    description: 'Overrides weekday/weekend defaults on July 4.'
  },
  [DayPresetType.LABOR_DAY]: {
    title: 'Labor Day',
    description: 'Overrides weekday/weekend defaults on Labor Day.'
  }
};

function formatZone(zone: Zone) {
  return zoneLabels[zone] ?? zone.replaceAll('_', ' ');
}

export default async function AdminPage() {
  const [stands, presets] = await Promise.all([
    prisma.stand.findMany({
      orderBy: [
        { zone: 'asc' },
        { label: 'asc' }
      ],
      select: {
        id: true,
        label: true,
        zone: true,
        supportsAS: true,
        neverSupportsAS: true
      }
    }),
    prisma.afternoonPreset.findMany({
      include: {
        entries: {
          select: {
            standId: true,
            enabled: true
          }
        }
      },
      orderBy: {
        presetType: 'asc'
      }
    })
  ]);

  const zoneOptions = Object.values(Zone).map((zone) => ({
    value: zone,
    label: formatZone(zone)
  }));

  const presetByType = new Map(presets.map((preset) => [preset.presetType, preset]));

  const presetSections = afternoonPresetTypes.map((presetType) => {
    const preset = presetByType.get(presetType);
    const meta = presetDetails[presetType];

    const entries = stands.map((stand) => {
      const matchedEntry = preset?.entries.find((entry) => entry.standId === stand.id);
      const enabled = matchedEntry?.enabled ?? !stand.neverSupportsAS;

      return {
        standId: stand.id,
        label: stand.label,
        zoneLabel: formatZone(stand.zone),
        enabled,
        disabled: stand.neverSupportsAS
      };
    });

    return {
      presetType,
      title: meta.title,
      description: meta.description,
      entries
    };
  });

  const lockedStands = stands.filter((stand) => stand.neverSupportsAS);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-14">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-cyan-300">Admin Console</p>
          <h1 className="text-3xl font-semibold">Scheduling & Muster Configuration</h1>
          <p className="text-sm text-slate-400">
            Manage foundational data for the scheduler. Authentication and full RBAC enforcement are
            still in progress; this view is the first pass at stand and zone management.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <CreateStandForm zoneOptions={zoneOptions} />

          <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70">
            <div className="border-b border-slate-800 px-6 py-4">
              <h2 className="text-lg font-semibold text-cyan-200">Existing Stands</h2>
              <p className="text-sm text-slate-400">
                {stands.length} stand{stands.length === 1 ? '' : 's'} tracked.{' '}
                {lockedStands.length > 0
                  ? `${lockedStands.length} permanently skip afternoon shifts.`
                  : null}
              </p>
            </div>

            {stands.length === 0 ? (
              <p className="px-6 py-6 text-sm text-slate-400">
                No stands have been added yet. Use the form to create the first entry.
              </p>
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead className="bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Label</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">Zone</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">
                        Afternoon Shift
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {stands.map((stand) => (
                      <tr key={stand.id} className="hover:bg-slate-900/60">
                        <td className="px-6 py-3 font-medium text-slate-100">{stand.label}</td>
                        <td className="px-6 py-3 text-slate-300">{formatZone(stand.zone)}</td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            {stand.neverSupportsAS ? (
                              <span className="inline-flex items-center rounded-full bg-slate-700/40 px-2 py-0.5 text-xs font-semibold text-slate-300">
                                Locked Off
                              </span>
                            ) : (
                              <>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    stand.supportsAS
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-slate-700/40 text-slate-300'
                                  }`}
                                >
                                  {stand.supportsAS ? 'Enabled' : 'Disabled'}
                                </span>
                                <form action={updateStandAfternoonAction}>
                                  <input type="hidden" name="standId" value={stand.id} />
                                  <input
                                    type="hidden"
                                    name="supportsAS"
                                    value={(!stand.supportsAS).toString()}
                                  />
                                  <button
                                    type="submit"
                                    className="rounded-md border border-slate-700 px-2 py-1 text-xs font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-200"
                                  >
                                    {stand.supportsAS ? 'Disable' : 'Enable'}
                                  </button>
                                </form>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <section className="space-y-4 rounded-lg border border-slate-800 bg-slate-900/70 p-6">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-cyan-200">Afternoon Shift Presets</h2>
            <p className="text-sm text-slate-400">
              Presets define which stands receive afternoon coverage by default for weekdays,
              weekends, and key holidays. Cro stands along with 56 &amp; 57 stay locked off.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {presetSections.map((preset) => (
              <AfternoonPresetForm
                key={preset.presetType}
                presetType={preset.presetType}
                title={preset.title}
                description={preset.description}
                entries={preset.entries}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
