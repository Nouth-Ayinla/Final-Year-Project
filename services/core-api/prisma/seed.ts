import { PrismaClient, AdminRole, Sex, MaritalStatus, EducationLevel } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';


const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);


const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seeding...');


  await prisma.candidate.deleteMany({});
  await prisma.party.deleteMany({});
  await prisma.voter.deleteMany({});
  await prisma.admin.deleteMany({});

  // Seed default parties
  const defaultParties = [
    { id: 'party-apc', name: 'All Progressives Congress', abbreviation: 'APC', primaryColor: '#D95300', secondaryColor: '#0EA5E9', description: 'All Progressives Congress (APC)' },
    { id: 'party-pdp', name: 'People\'s Democratic Party', abbreviation: 'PDP', primaryColor: '#0EA5E9', secondaryColor: '#EAB308', description: 'People\'s Democratic Party (PDP)' },
    { id: 'party-lp', name: 'Labour Party', abbreviation: 'LP', primaryColor: '#22C55E', secondaryColor: '#EF4444', description: 'Labour Party (LP)' },
    { id: 'party-nnpp', name: 'New Nigeria People\'s Party', abbreviation: 'NNPP', primaryColor: '#EAB308', secondaryColor: '#1E293B', description: 'New Nigeria People\'s Party (NNPP)' },
    { id: 'party-apga', name: 'All Progressives Grand Alliance', abbreviation: 'APGA', primaryColor: '#10B981', secondaryColor: '#F59E0B', description: 'All Progressives Grand Alliance (APGA)' },
    { id: 'party-sdp', name: 'Social Democratic Party', abbreviation: 'SDP', primaryColor: '#EF4444', secondaryColor: '#3B82F6', description: 'Social Democratic Party (SDP)' },
    { id: 'party-ypp', name: 'Young Progressives Party', abbreviation: 'YPP', primaryColor: '#8B5CF6', secondaryColor: '#EC4899', description: 'Young Progressives Party (YPP)' },
  ];

  for (const party of defaultParties) {
    await prisma.party.create({ data: party });
  }
  console.log('Default political parties seeded.');

  const defaultPassword = '@12345678';
  const hashedSuperAdminPassword = await bcrypt.hash(defaultPassword, 10);
  const dummyHashedPin = await bcrypt.hash('1234', 10);


  const superAdmin = await prisma.admin.create({
    data: {
      firstName: 'Ayinla',
      surname: 'Oluwaferanmi',
      email: 'shawolhorizon@gmail.com',
      profilePicture: '',
      DOB: '1985-05-15',
      sex: Sex.MALE,
      maritalStatus: MaritalStatus.SINGLE,
      state: 'Lagos',
      LGA: 'Ikeja',
      education: EducationLevel.TERTIARY,
      residentialAddress: '123 Main Admin Street, Lagos',
      role: AdminRole.SUPER_ADMIN,
      adminId: 'ADM-2026-0001',
      activationPin: dummyHashedPin,
      isActivated: true,
      password: hashedSuperAdminPassword,
    },
  });

  console.log(`Super Admin seeded: ${superAdmin.email} (${superAdmin.adminId})`);
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(' Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });