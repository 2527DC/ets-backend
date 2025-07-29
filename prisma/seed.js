import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedModules() {
  console.log('🌱 Seeding modules & submodules only...');

  const modulesData = [
    { name: 'Dashboard', key: 'dashboard', children: [] },
    { name: 'Role Management', key: 'role-management', children: [] },
    { name: 'User Administrator', key: 'user-administrator', children: [] },
    { name: 'Manage Team', key: 'manage-team', children: [] },
    { name: 'Manage Clients', key: 'manage-clients', children: [] },
    {
      name: 'Scheduling Management', key: 'scheduling-management', children: [
        { name: 'Manage Shift', key: 'manage-shift' },
        { name: 'Manage Shift Categories', key: 'manage-shift-categories' },
      ],
    },
    { name: 'Manage Drivers', key: 'manage-drivers', children: [] },
    { name: 'Manage Vendors', key: 'manage-vendors', children: [] },
    {
      name: 'Manage Contracts', key: 'manage-contracts', children: [
        { name: 'Vehicle Contract', key: 'vehicle-contract' },
        { name: 'Adjustment Penalty', key: 'adjustment-penalty' },
        { name: 'Cost Center', key: 'cost-center' },
        { name: 'Show Contracts In Master', key: 'show-contractsInMaster' },
        { name: 'All Contracts', key: 'AllContracts' },
      ],
    },
    { name: 'Routing', key: 'routing', children: [] },
    { name: 'Tracking', key: 'tracking', children: [] },
    { name: 'Audit Report', key: 'audit-report', children: [] },
    {
      name: 'Security Dashboard', key: 'security-dashboard', children: [
        { name: 'SMS Config', key: 'sms-config' },
      ],
    },
  ];

  for (const mod of modulesData) {
    const parent = await prisma.module.create({
      data: { name: mod.name, key: mod.key }
    });

    for (const child of mod.children) {
      await prisma.module.create({
        data: {
          name: child.name,
          key: child.key,
          parentId: parent.id
        }
      });
    }
  }

  console.log('✅ Modules and submodules seeded successfully!');
}

seedModules()
  .catch((err) => {
    console.error('❌ Seeding modules failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
