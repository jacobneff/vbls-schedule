import { Zone } from '@prisma/client';

import { CreateStandForm } from './_components/CreateStandForm';
import { prisma } from '@/server/db';

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

function formatZone(zone: Zone) {
  return zoneLabels[zone] ?? zone.replaceAll('_', ' ');
}

export default async function AdminPage() {
  const stands = await prisma.stand.findMany({
    orderBy: [
      { zone: 'asc' },
      { label: 'asc' }
    ]
  });

  const zoneOptions = Object.values(Zone).map((zone) => ({
    value: zone,
    label: formatZone(zone)
  }));

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
                {stands.length} stand{stands.length === 1 ? '' : 's'} tracked in the system.
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
                      <th className="px-6 py-3 text-left font-semibold text-slate-300">AS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {stands.map((stand) => (
                      <tr key={stand.id} className="hover:bg-slate-900/60">
                        <td className="px-6 py-3 font-medium text-slate-100">{stand.label}</td>
                        <td className="px-6 py-3 text-slate-300">{formatZone(stand.zone)}</td>
                        <td className="px-6 py-3">
                          {stand.supportsAS ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-700/40 px-2 py-0.5 text-xs font-semibold text-slate-300">
                              No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
