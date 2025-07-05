import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1️⃣ Create Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const superAdmin = await prisma.admin.create({
    data: {
      name: 'Super Admin',
      email: 'superadmin@example.com',
      password: adminPassword,
    },
  });
  console.log('✅ Created Super Admin:', superAdmin.email);

  // 2️⃣ Create Modules & Submodules
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

  console.log('🔧 Creating modules & submodules...');
  const parentModules = {};

  for (const mod of modulesData) {
    const parent = await prisma.module.create({
      data: { name: mod.name, key: mod.key }
    });
    parentModules[mod.key] = parent;

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
  console.log('✅ Created modules & submodules');

  // 3️⃣ Give Super Admin full permissions
  const allModules = await prisma.module.findMany();
  console.log('🔐 Assigning Super Admin permissions...');
  for (const module of allModules) {
    await prisma.adminPermission.create({
      data: {
        adminId: superAdmin.id,
        moduleId: module.id,
        canRead: true,
        canWrite: true,
        canDelete: true,
      }
    });
  }
  console.log('✅ Super Admin now has full permissions');

  // 4️⃣ Create a demo Company
  const company = await prisma.company.create({
    data: {
      name: 'Fleet Quest Pvt Ltd',
      email: 'company@example.com',
      phone: '9999999999',
      address: 'Bangalore',
    },
  });
  console.log('🏢 Created Company:', company.name);

  // 5️⃣ Create Company Admin Role
  const companyRole = await prisma.role.create({
    data: {
      name: 'Company Admin',
      companyId: company.id,
    },
  });
  console.log('✅ Created Role:', companyRole.name);

  // 6️⃣ Give Company Admin full permissions
  console.log('🔐 Assigning Company Admin permissions...');
  for (const module of allModules) {
    await prisma.rolePermission.create({
      data: {
        roleId: companyRole.id,
        moduleId: module.id,
        canRead: true,
        canWrite: true,
        canDelete: true,
      }
    });
  }
  console.log('✅ Company Admin now has full permissions');

  // 7️⃣ Create an Employee under this company & role
  const employeePassword = await bcrypt.hash('employee123', 10);
  const employee = await prisma.employee.create({
    data: {
      name: 'John Employee',
      email: 'employee@example.com',
      password: employeePassword,
      phone: '8888888888',
      companyId: company.id,
      roleId: companyRole.id,
    },
  });
  console.log('👩‍💼 Created Employee:', employee.email);

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
