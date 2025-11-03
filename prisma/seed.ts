import {
  PrismaClient,
  Role,
  Zone,
  ShiftType,
  AssignStatus,
  DayPresetType
} from '@prisma/client';

const prisma = new PrismaClient();

const baselineDate = new Date(Date.UTC(2024, 5, 24)); // Monday, 24 June 2024

type StandSeed = {
  label: string;
  zone: Zone;
  supportsAS: boolean;
  doubleStaffed: boolean;
  neverSupportsAS: boolean;
};

function createStandRange(start: number, end: number, zone: Zone): StandSeed[] {
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const label = String(start + index);
    return {
      label,
      zone,
      supportsAS: true,
      doubleStaffed: false,
      neverSupportsAS: false
    };
  });
}

const stands: StandSeed[] = [
  ...Array.from({ length: 6 }, (_, index) => ({
    label: `Cro ${index + 1}`,
    zone: Zone.CROATAN,
    supportsAS: false,
    doubleStaffed: false,
    neverSupportsAS: true
  })),
  ...createStandRange(2, 14, Zone.RESORT_SOUTH),
  ...createStandRange(15, 28, Zone.RESORT_MIDDLE),
  ...createStandRange(29, 42, Zone.RESORT_NORTH),
  {
    label: '56',
    zone: Zone.FIFTY_SEVENTH,
    supportsAS: false,
    doubleStaffed: false,
    neverSupportsAS: true
  },
  {
    label: '57',
    zone: Zone.FIFTY_SEVENTH,
    supportsAS: false,
    doubleStaffed: false,
    neverSupportsAS: true
  }
];

const presetTypes: DayPresetType[] = [
  DayPresetType.WEEKDAY,
  DayPresetType.WEEKEND,
  DayPresetType.MEMORIAL_DAY,
  DayPresetType.INDEPENDENCE_DAY,
  DayPresetType.LABOR_DAY
];

type RosterEntry = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  yearsAtVBLS: number;
  phone?: string;
  isRookie?: boolean;
  alwaysOff?: string[];
  guardPrefs?: Record<string, unknown>;
  assignments?: Array<{
    stand: string;
    shift: ShiftType;
    status?: AssignStatus;
    isExtra?: boolean;
    notes?: string;
  }>;
};

const seniorityRoster: RosterEntry[] = [
  {
    firstName: 'Alex',
    lastName: 'Rivera',
    email: 'alex.rivera@vbls.local',
    role: Role.SUPERVISOR,
    yearsAtVBLS: 6,
    phone: '757-555-0101',
    assignments: [
      { stand: 'Cro 1', shift: ShiftType.REG, notes: 'Zone lead for Croatan.' }
    ]
  },
  {
    firstName: 'Taylor',
    lastName: 'Chen',
    email: 'taylor.chen@vbls.local',
    role: Role.GUARD,
    yearsAtVBLS: 4,
    phone: '757-555-0124',
    guardPrefs: { regOnly: true },
    assignments: [{ stand: '16', shift: ShiftType.REL }]
  },
  {
    firstName: 'Jordan',
    lastName: 'Singh',
    email: 'jordan.singh@vbls.local',
    role: Role.GUARD,
    yearsAtVBLS: 3,
    phone: '757-555-0188',
    assignments: [{ stand: '29', shift: ShiftType.REG }]
  },
  {
    firstName: 'Morgan',
    lastName: 'Patel',
    email: 'morgan.patel@vbls.local',
    role: Role.GUARD,
    yearsAtVBLS: 1,
    phone: '757-555-0217',
    isRookie: true,
    alwaysOff: ['MONDAY'],
    assignments: [
      { stand: '57', shift: ShiftType.AS, isExtra: true, notes: 'Shadowing senior guard.' }
    ]
  }
];

const baselineAdmin: RosterEntry = {
  firstName: 'Casey',
  lastName: 'Morrow',
  email: 'admin@vbls.local',
  role: Role.ADMIN,
  yearsAtVBLS: 10,
  phone: '757-555-0001'
};

async function seedStands() {
  for (const stand of stands) {
    await prisma.stand.upsert({
      where: { label: stand.label },
      update: {
        zone: stand.zone,
        supportsAS: stand.supportsAS && !stand.neverSupportsAS,
        doubleStaffed: stand.doubleStaffed,
        neverSupportsAS: stand.neverSupportsAS
      },
      create: {
        label: stand.label,
        zone: stand.zone,
        supportsAS: stand.supportsAS && !stand.neverSupportsAS,
        doubleStaffed: stand.doubleStaffed,
        neverSupportsAS: stand.neverSupportsAS
      }
    });
  }
}

async function seedUsers() {
  const everyone = [...seniorityRoster, baselineAdmin];

  for (const user of everyone) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        yearsAtVBLS: user.yearsAtVBLS,
        phone: user.phone ?? null,
        isRookie: user.isRookie ?? false,
        alwaysOff: user.alwaysOff ?? [],
        guardPrefs: user.guardPrefs ?? null
      },
      create: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        yearsAtVBLS: user.yearsAtVBLS,
        phone: user.phone ?? null,
        isRookie: user.isRookie ?? false,
        alwaysOff: user.alwaysOff ?? [],
        guardPrefs: user.guardPrefs ?? null
      }
    });
  }
}

async function seedDailyPlan() {
  return prisma.dailyPlan.upsert({
    where: { date: baselineDate },
    update: {},
    create: {
      date: baselineDate,
      asPattern: 'baseline',
      overscheduleTarget: 2,
      hotspotFlags: {
        zones: ['RESORT_MIDDLE'],
        stands: ['16']
      }
    }
  });
}

async function seedAfternoonPresets() {
  const allStands = await prisma.stand.findMany({
    orderBy: [{ zone: 'asc' }, { label: 'asc' }]
  });

  for (const presetType of presetTypes) {
    const preset = await prisma.afternoonPreset.upsert({
      where: { presetType },
      update: {},
      create: { presetType }
    });

    for (const stand of allStands) {
      const enabled = !stand.neverSupportsAS;
      await prisma.afternoonPresetEntry.upsert({
        where: {
          stand_preset_unique: {
            standId: stand.id,
            presetId: preset.id
          }
        },
        update: {
          enabled
        },
        create: {
          standId: stand.id,
          presetId: preset.id,
          enabled
        }
      });
    }
  }
}

async function seedAssignments(dailyPlanId: number) {
  const users = await prisma.user.findMany({
    where: { email: { in: seniorityRoster.map((guard) => guard.email) } }
  });
  const userByEmail = new Map(users.map((user) => [user.email, user]));

  const assignments = seniorityRoster.flatMap((guard) =>
    guard.assignments?.map((assignment) => ({
      email: guard.email,
      ...assignment
    })) ?? []
  );

  const standLabels = Array.from(new Set(assignments.map((assignment) => assignment.stand)));
  const standsByLabel = new Map(
    (
      await prisma.stand.findMany({
        where: { label: { in: standLabels } }
      })
    ).map((stand) => [stand.label, stand])
  );

  for (const assignment of assignments) {
    const user = userByEmail.get(assignment.email);
    if (!user) continue;

    const stand = standsByLabel.get(assignment.stand);

    await prisma.assignment.upsert({
      where: {
        assignment_unique_shift_per_guard: {
          date: baselineDate,
          userId: user.id,
          shift: assignment.shift
        }
      },
      update: {
        standId: stand?.id ?? null,
        status: assignment.status ?? AssignStatus.SCHEDULED,
        isExtra: assignment.isExtra ?? false,
        notes: assignment.notes ?? null,
        dailyPlanId
      },
      create: {
        date: baselineDate,
        shift: assignment.shift,
        status: assignment.status ?? AssignStatus.SCHEDULED,
        isExtra: assignment.isExtra ?? false,
        notes: assignment.notes ?? null,
        userId: user.id,
        standId: stand?.id ?? null,
        dailyPlanId
      }
    });
  }
}

async function main() {
  console.log('🌊 Seeding VBLS baseline data...');

  await seedStands();
  await seedUsers();
  await seedAfternoonPresets();
  const dailyPlan = await seedDailyPlan();
  await seedAssignments(dailyPlan.id);

  console.log('✅ Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
