import { PrismaClient, Role, Zone, ShiftType, AssignStatus } from '@prisma/client';

const prisma = new PrismaClient();

const stands = [
  { label: 'Cro 1', zone: Zone.CROATAN, supportsAS: false },
  { label: 'Cro 2', zone: Zone.CROATAN, supportsAS: false },
  { label: '2', zone: Zone.RESORT_SOUTH, supportsAS: true },
  { label: '16', zone: Zone.RESORT_MIDDLE, supportsAS: true },
  { label: '29', zone: Zone.RESORT_NORTH, supportsAS: true },
  { label: '56', zone: Zone.FIFTY_SEVENTH, supportsAS: false },
  { label: '57', zone: Zone.FIFTY_SEVENTH, supportsAS: false }
];

const seniorityRoster = [
  { firstName: 'Alex', lastName: 'Rivera', yearsAtVBLS: 6, role: Role.SUPERVISOR },
  { firstName: 'Taylor', lastName: 'Chen', yearsAtVBLS: 4, role: Role.GUARD },
  { firstName: 'Jordan', lastName: 'Singh', yearsAtVBLS: 3, role: Role.GUARD },
  { firstName: 'Morgan', lastName: 'Patel', yearsAtVBLS: 1, role: Role.GUARD, isRookie: true }
];

async function main() {
  console.log('🌊 Seeding VBLS baseline data...');

  await prisma.stand.createMany({
    data: stands,
    skipDuplicates: true
  });

  for (const [index, guard] of seniorityRoster.entries()) {
    await prisma.user.upsert({
      where: { email: `${guard.firstName.toLowerCase()}@vbls.local` },
      update: {
        yearsAtVBLS: guard.yearsAtVBLS
      },
      create: {
        email: `${guard.firstName.toLowerCase()}@vbls.local`,
        firstName: guard.firstName,
        lastName: guard.lastName,
        role: guard.role,
        yearsAtVBLS: guard.yearsAtVBLS,
        isRookie: guard.isRookie ?? false,
        alwaysOff: [],
        guardPrefs: index === 1 ? { regOnly: true } : null
      }
    });
  }

  const sampleDate = new Date();
  sampleDate.setUTCHours(0, 0, 0, 0);

  const dailyPlan = await prisma.dailyPlan.upsert({
    where: { date: sampleDate },
    update: {},
    create: {
      date: sampleDate,
      asPattern: 'baseline',
      overscheduleTarget: 2,
      hotspotFlags: {
        zones: ['RESORT_MIDDLE'],
        stands: ['16']
      }
    }
  });

  const [alex, taylor] = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    take: 2
  });

  if (alex && taylor) {
    const stand16 = await prisma.stand.findFirst({ where: { label: '16' } });
    const stand2 = await prisma.stand.findFirst({ where: { label: '2' } });

    await prisma.assignment.createMany({
      data: [
        {
          date: sampleDate,
          shift: ShiftType.REG,
          status: AssignStatus.SCHEDULED,
          userId: alex.id,
          standId: stand16?.id ?? null,
          dailyPlanId: dailyPlan.id
        },
        {
          date: sampleDate,
          shift: ShiftType.REL,
          status: AssignStatus.SCHEDULED,
          userId: taylor.id,
          standId: stand2?.id ?? null,
          dailyPlanId: dailyPlan.id
        }
      ],
      skipDuplicates: true
    });
  }

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
