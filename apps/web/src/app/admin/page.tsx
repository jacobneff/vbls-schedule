import { DayPresetType, Role, Zone } from '@prisma/client';

import { AfternoonPresetForm } from './_components/AfternoonPresetForm';
import { SignOutControl } from './_components/SignOutControl';
import { prisma } from '@/server/db';
import { updateStandAfternoonAction, updateStandDoubleStaffedAction } from '@/server/actions/stand';
import { afternoonPresetTypes } from '@/lib/afternoonPresets';
import { requireUserWithRole } from '@/server/auth/session';
import { updateUserSeniorityAction } from '@/server/actions/user';

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

const zoneSortOrder: Zone[] = [
  Zone.RESORT_SOUTH,
  Zone.RESORT_MIDDLE,
  Zone.RESORT_NORTH,
  Zone.FIFTY_SEVENTH,
  Zone.CROATAN
];

const zonePriority = new Map(zoneSortOrder.map((zone, index) => [zone, index]));

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

function getZoneRank(zone: Zone) {
  return zonePriority.get(zone) ?? Number.MAX_SAFE_INTEGER;
}

function getCroatanIndex(label: string) {
  const match = /^Cro\s*(\d+)/i.exec(label);
  if (!match) {
    return null;
  }
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export default async function AdminPage() {
  const currentUser = await requireUserWithRole([Role.ADMIN, Role.SUPERVISOR]);

  const [stands, presets, users] = await Promise.all([
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
        doubleStaffed: true,
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
    }),
    prisma.user.findMany({
      orderBy: [
        { role: 'asc' },
        { lastName: 'asc' },
        { firstName: 'asc' }
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        yearsAtVBLS: true,
        isRookie: true
      }
    })
  ]);

  const sortedStands = [...stands].sort((a, b) => {
    const zoneDifference = getZoneRank(a.zone) - getZoneRank(b.zone);
    if (zoneDifference !== 0) {
      return zoneDifference;
    }

    if (a.zone === Zone.CROATAN) {
      const aCro = getCroatanIndex(a.label);
      const bCro = getCroatanIndex(b.label);
      if (aCro !== null && bCro !== null) {
        return bCro - aCro;
      }
    } else {
      const aNum = Number(a.label);
      const bNum = Number(b.label);
      if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
        return aNum - bNum;
      }
    }

    return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' });
  });

  const presetByType = new Map(presets.map((preset) => [preset.presetType, preset]));

  const presetSections = afternoonPresetTypes.map((presetType) => {
    const preset = presetByType.get(presetType);
    const meta = presetDetails[presetType];

    const entries = sortedStands.map((stand) => {
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

  const lockedStands = sortedStands.filter((stand) => stand.neverSupportsAS);
  const canManageUsers = currentUser.role === Role.ADMIN;
  const roleOptions = Object.values(Role) as Role[];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-14">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-400">
            Signed in as{' '}
            <span className="font-semibold text-slate-200">
              {currentUser.firstName} {currentUser.lastName}
            </span>{' '}
            · {currentUser.role.toLowerCase()}
          </div>
          <SignOutControl />
        </div>

        <header className="space-y-2">
          <p className="text-sm uppercase tracking-widest text-cyan-300">Admin Console</p>
          <h1 className="text-3xl font-semibold">Scheduling & Muster Configuration</h1>
          <p className="text-sm text-slate-400">
            Manage foundational data for the scheduler. Authentication and full RBAC enforcement are
            still in progress; this view is the first pass at stand and zone management.
          </p>
        </header>

        <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-cyan-200">Guard Seniority & Roles</h2>
            <p className="text-sm text-slate-400">
              {canManageUsers
                ? 'Update guard years at VBLS, rookie status, and roles.'
                : 'View guard seniority details. Admins can adjust values as needed.'}
            </p>
          </div>
          <div className="divide-y divide-slate-800">
            {users.map((user) =>
              canManageUsers ? (
                <form
                  key={user.id}
                  action={updateUserSeniorityAction}
                  className="grid gap-4 px-6 py-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <input type="hidden" name="userId" value={user.id} />
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Years at VBLS
                    <input
                      type="number"
                      min={0}
                      name="yearsAtVBLS"
                      defaultValue={user.yearsAtVBLS}
                      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Role
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                    >
                      {roleOptions.map((roleOption) => (
                        <option key={roleOption} value={roleOption}>
                          {roleOption.toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center justify-end gap-3">
                    <label className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        name="isRookie"
                        defaultChecked={user.isRookie}
                        className="h-4 w-4 rounded border border-slate-700 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                      />
                      Rookie
                    </label>
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-md bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  key={user.id}
                  className="grid gap-4 px-6 py-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-200">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <div className="text-sm text-slate-300">
                    <span className="font-semibold">{user.yearsAtVBLS}</span> year
                    {user.yearsAtVBLS === 1 ? '' : 's'}
                  </div>
                  <div className="text-sm capitalize text-slate-300">{user.role.toLowerCase()}</div>
                  <div className="text-sm text-slate-300">{user.isRookie ? 'Rookie' : 'Returning'}</div>
                </div>
              )
            )}
            {users.length === 0 ? (
              <p className="px-6 py-4 text-sm text-slate-400">No guards found in the system.</p>
            ) : null}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-lg font-semibold text-cyan-200">Existing Stands</h2>
            <p className="text-sm text-slate-400">
              {sortedStands.length} stand{sortedStands.length === 1 ? '' : 's'} tracked.{' '}
              {lockedStands.length > 0
                ? `${lockedStands.length} permanently skip afternoon shifts.`
                : null}
            </p>
          </div>

          {sortedStands.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-400">
              No stands have been added yet.
            </p>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="sticky top-0 bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Stand</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">Zone</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">
                      Afternoon Shift
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-300">
                      Double Staffing
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sortedStands.map((stand) => (
                    <tr key={stand.id} className="hover:bg-slate-900/60">
                      <td className="px-6 py-3 font-medium text-slate-100">{stand.label}</td>
                      <td className="px-6 py-3 text-slate-300">{formatZone(stand.zone)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          {stand.neverSupportsAS ? (
                            <span className="inline-flex items-center rounded-full bg-slate-700/40 px-2 py-0.5 text-xs font-semibold text-slate-300">
                              Locked Off
                            </span>
                          ) : (
                            <form action={updateStandAfternoonAction}>
                              <input type="hidden" name="standId" value={stand.id} />
                              <input
                                type="hidden"
                                name="supportsAS"
                                value={(!stand.supportsAS).toString()}
                              />
                              <button
                                type="submit"
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition ${
                                  stand.supportsAS
                                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                    : 'bg-slate-700/40 text-slate-300 hover:bg-slate-700/60'
                                }`}
                              >
                                {stand.supportsAS ? 'Enabled' : 'Disabled'}
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <form action={updateStandDoubleStaffedAction}>
                          <input type="hidden" name="standId" value={stand.id} />
                          <input
                            type="hidden"
                            name="doubleStaffed"
                            value={(!stand.doubleStaffed).toString()}
                          />
                          <button
                            type="submit"
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition ${
                              stand.doubleStaffed
                                ? 'bg-amber-500/20 text-amber-200 hover:bg-amber-500/30'
                                : 'bg-slate-700/40 text-slate-300 hover:bg-slate-700/60'
                            }`}
                          >
                            {stand.doubleStaffed ? 'Double Staffed' : 'Single Coverage'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

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
