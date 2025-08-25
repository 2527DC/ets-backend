import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// modules data (parent + submodules)
const modules = [
  { key: 'role-management', name: 'Role Management', submodules: [] },
  { key: 'manage-team', name: 'Manage Team', submodules: [] },
  { key: 'manage-clients', name: 'Manage Clients', submodules: [] },
  {
    key: 'scheduling-management', 
    name: 'Scheduling Management',
    submodules: [
      { key: 'manage-shift', name: 'Manage Shift' },
      { key: 'manage-shift-categories', name: 'Shift Categories' }
    ]
  },
  { key: 'manage-drivers', name: 'Manage Drivers', submodules: [] },
  { 
    key: 'manage-vehicles', 
    name: 'Manage Vehicles', 
    submodules: [
      { key: 'manage-vehicleType', name: 'Manage VehicleType' }
    ] 
  },
  { key: 'manage-vendors', name: 'Manage Vendors', submodules: [] },
  { key: 'routing', name: 'Manage Routing', submodules: [] },
  { key: 'tracking', name: 'Manage Tracking', submodules: [] },
  { key: 'audit-report', name: 'Audit Report', submodules: [] },
  { key: 'admin-dashboard', name: 'Admin Dashboard', submodules: [] },
];

async function main() {
  console.log('🚀 Seeding modules...');

  // First, create all parent modules
  for (const mod of modules) {
    await prisma.module.upsert({
      where: { key: mod.key },
      update: { 
        name: mod.name, 
        isActive: true,
        parentId: null // Ensure parentId is null for top-level modules
      },
      create: {
        key: mod.key,
        name: mod.name,
        isActive: true,
        parentId: null // Explicitly set to null for top-level modules
      }
    });
  }

  // Then, create all submodules with their proper parent relationships
  for (const mod of modules) {
    if (mod.submodules.length > 0) {
      const parentModule = await prisma.module.findUnique({
        where: { key: mod.key }
      });

      if (!parentModule) {
        console.error(`Parent module not found: ${mod.key}`);
        continue;
      }

      for (const sub of mod.submodules) {
        await prisma.module.upsert({
          where: { key: sub.key },
          update: { 
            name: sub.name, 
            isActive: true, 
            parentId: parentModule.id 
          },
          create: {
            key: sub.key,
            name: sub.name,
            parentId: parentModule.id,
            isActive: true
          }
        });
      }
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