import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// modules data (parent + submodules)
const modules = [
  { key: 'dashboard', name: 'Dashboard', submodules: [] },
  { key: 'role-management', name: 'Role Management', submodules: [] },
  { key: 'user-administrator', name: 'User Administrator', submodules: [] },
  { key: 'manage-team', name: 'Manage Team', submodules: [] },
  { key: 'manage-clients', name: 'Manage Clients', submodules: [] },
  {
    key: 'scheduling-management', name: 'Scheduling Management',
    submodules: [
      { key: 'manage-shift', name: 'Manage Shift' },
      { key: 'manage-shift-categories', name: 'Shift Categories' }
    ]
  },
  { key: 'manage-drivers', name: 'Manage Drivers', submodules: [] },
  { key: 'manage-vendors', name: 'Manage Vendors', submodules: [] },
  {
    key: 'manage-contracts', name: 'Manage Contracts',
    submodules: [
      { key: 'vehicle-contract', name: 'Vehicle Contract' },
      { key: 'adjustment-penalty', name: 'Adjustment & Penalty' },
      { key: 'cost-center', name: 'Cost Center' },
      { key: 'show-contractsInMaster', name: 'Master Contracts' },
      { key: 'AllContracts', name: 'New Contracts' }
    ]
  },
  { key: 'routing', name: 'Manage Routing', submodules: [] },
  { key: 'tracking', name: 'Manage Tracking', submodules: [] },
  { key: 'audit-report', name: 'Audit Report', submodules: [] },
  {
    key: 'security-dashboard', name: 'Security Dashboard',
    submodules: [
      { key: 'sms-config', name: 'SMS Config' }
    ]
  },
  { key: 'admin-dashboard', name: 'Admin Dashboard', submodules: [] },
  { key: 'employee-dashboard', name: 'Employee Dashboard', submodules: [] }
];

async function main() {
  console.log('🚀 Seeding modules...');

  for (const mod of modules) {
    // Create parent module
    const parent = await prisma.module.upsert({
      where: { key: mod.key },
      update: { name: mod.name, isActive: true },
      create: {
        key: mod.key,
        name: mod.name,
        isActive: true
      }
    });

    // Create submodules
    for (const sub of mod.submodules) {
      await prisma.module.upsert({
        where: { key: sub.key },
        update: { name: sub.name, isActive: true, parentId: parent.id },
        create: {
          key: sub.key,
          name: sub.name,
          parentId: parent.id,
          isActive: true
        }
      });
    }
  }

  console.log('✅ Modules seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding modules:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
