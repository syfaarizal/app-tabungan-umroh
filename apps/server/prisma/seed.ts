import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: { name: RoleName.ADMIN },
  });

  const userRole = await prisma.role.upsert({
    where: { name: RoleName.USER },
    update: {},
    create: { name: RoleName.USER },
  });

  console.log('Seeding admin account...');
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '081234567890' },
    update: {},
    create: {
      fullName: 'Admin Utama',
      phoneNumber: '081234567890',
      email: 'admin@tabunganumroh.local',
      passwordHash: adminPasswordHash,
      roleId: adminRole.id,
    },
  });

  console.log('Seeding sample jamaah (users)...');
  const sampleUsers = [
    { fullName: 'Ahmad', phoneNumber: '081111111111', target: 25000000, balance: 12500000 },
    { fullName: 'Siti Aminah', phoneNumber: '081222222222', target: 20000000, balance: 8750000 },
    { fullName: 'Budi Santoso', phoneNumber: '081333333333', target: 25000000, balance: 15250000 },
    { fullName: 'Dewi Lestari', phoneNumber: '081444444444', target: 20000000, balance: 5000000 },
  ];

  const userPasswordHash = await bcrypt.hash('User123!', 10);

  for (const u of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { phoneNumber: u.phoneNumber },
      update: {},
      create: {
        fullName: u.fullName,
        phoneNumber: u.phoneNumber,
        passwordHash: userPasswordHash,
        roleId: userRole.id,
      },
    });

    const account = await prisma.savingAccount.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        currentBalance: u.balance,
        targetAmount: u.target,
      },
    });

    await prisma.transaction.create({
      data: {
        savingAccountId: account.id,
        type: 'DEPOSIT',
        status: 'CONFIRMED',
        amount: u.balance,
        note: 'Setoran awal',
        recordedByAdminId: admin.id,
      },
    });
  }

  console.log('Seeding default settings...');
  await prisma.setting.upsert({
    where: { key: 'default_target_amount' },
    update: {},
    create: { key: 'default_target_amount', value: '25000000' },
  });

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
