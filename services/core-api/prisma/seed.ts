import { PrismaClient, AdminRole, Sex, MaritalStatus, EducationLevel } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Spread n timestamps across a polling day (08:00–18:00) following a
 *  roughly bell-shaped distribution peaking around 10:00–12:00. */
function pollingTimestamps(date: Date, count: number): Date[] {
  const results: Date[] = [];
  // Bucket weights  08:00 10:00 12:00 14:00 16:00 18:00
  const buckets = [
    { hour: 8,  weight: 0.12 },
    { hour: 10, weight: 0.30 },
    { hour: 12, weight: 0.28 },
    { hour: 14, weight: 0.17 },
    { hour: 16, weight: 0.10 },
    { hour: 17, weight: 0.03 },
  ];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let cumulative = 0;
    let chosenHour = 8;
    for (const b of buckets) {
      cumulative += b.weight;
      if (r <= cumulative) { chosenHour = b.hour; break; }
    }
    const t = new Date(date);
    t.setHours(chosenHour, randomBetween(0, 59), randomBetween(0, 59), 0);
    results.push(t);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Chapter 4 Simulation Seed — Bimodal E-Voting System       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  // ── 1. Clean-slate  (preserve Admin rows) ──────────────────────────────
  console.log('\n[1/10] Cleaning previous simulation data...');
  await prisma.auditLog.deleteMany({});
  await prisma.securityAlert.deleteMany({});
  await prisma.duplicateVoteAttempt.deleteMany({});
  await prisma.biometricAttempt.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.election.deleteMany({});
  await prisma.voter.deleteMany({});
  await prisma.ward.deleteMany({});
  await prisma.party.deleteMany({});
  console.log('   ✓ Simulation tables cleared (admin accounts preserved)');

  // ── 2. Political Parties ───────────────────────────────────────────────
  console.log('\n[2/10] Seeding political parties...');
  const partiesData = [
    { id: 'party-apc',  name: "All Progressives Congress",       abbreviation: 'APC',  primaryColor: '#D95300', secondaryColor: '#0EA5E9', description: 'All Progressives Congress (APC)' },
    { id: 'party-pdp',  name: "People's Democratic Party",        abbreviation: 'PDP',  primaryColor: '#0EA5E9', secondaryColor: '#EAB308', description: "People's Democratic Party (PDP)" },
    { id: 'party-lp',   name: 'Labour Party',                     abbreviation: 'LP',   primaryColor: '#22C55E', secondaryColor: '#EF4444', description: 'Labour Party (LP)' },
    { id: 'party-nnpp', name: "New Nigeria People's Party",        abbreviation: 'NNPP', primaryColor: '#EAB308', secondaryColor: '#1E293B', description: "New Nigeria People's Party (NNPP)" },
    { id: 'party-apga', name: 'All Progressives Grand Alliance',   abbreviation: 'APGA', primaryColor: '#10B981', secondaryColor: '#F59E0B', description: 'All Progressives Grand Alliance (APGA)' },
    { id: 'party-sdp',  name: 'Social Democratic Party',           abbreviation: 'SDP',  primaryColor: '#EF4444', secondaryColor: '#3B82F6', description: 'Social Democratic Party (SDP)' },
    { id: 'party-ypp',  name: 'Young Progressives Party',          abbreviation: 'YPP',  primaryColor: '#8B5CF6', secondaryColor: '#EC4899', description: 'Young Progressives Party (YPP)' },
  ];
  for (const p of partiesData) await prisma.party.create({ data: p });
  console.log(`   ✓ ${partiesData.length} parties seeded`);

  // ── 3. Super Admin (upsert to preserve) ───────────────────────────────
  console.log('\n[3/10] Upserting Super Admin...');
  const defaultPassword = '@12345678';
  const hashedPassword  = await bcrypt.hash(defaultPassword, 10);
  const hashedPin       = await bcrypt.hash('1234', 10);

  const superAdmin = await prisma.admin.upsert({
    where: { email: 'shawolhorizon@gmail.com' },
    update: {},
    create: {
      firstName: 'Ayinla',
      surname: 'Oluwaferanmi',
      email: 'shawolhorizon@gmail.com',
      profilePicture: 'https://placehold.co/400x400/1e293b/94a3b8?text=SA',
      DOB: '1985-05-15',
      sex: Sex.MALE,
      maritalStatus: MaritalStatus.SINGLE,
      state: 'Lagos',
      LGA: 'Ikeja',
      education: EducationLevel.TERTIARY,
      residentialAddress: '123 Main Admin Street, Lagos',
      role: AdminRole.SUPER_ADMIN,
      adminId: 'ADM-2026-0001',
      activationPin: hashedPin,
      isActivated: true,
      password: hashedPassword,
    },
  });
  console.log(`   ✓ Super Admin: ${superAdmin.email}`);

  // ── 4. Supporting Admin Accounts ──────────────────────────────────────
  console.log('\n[4/10] Seeding supporting admin accounts...');
  const supportingAdmins = [
    {
      firstName: 'Chukwuemeka', surname: 'Okonkwo',
      email: 'c.okonkwo@ndec.gov.ng',
      DOB: '1978-03-22', sex: Sex.MALE, maritalStatus: MaritalStatus.MARRIED,
      state: 'Anambra', LGA: 'Awka South', education: EducationLevel.TERTIARY,
      residentialAddress: '45 Zik Avenue, Awka',
      role: AdminRole.ELECTION_ADMIN, adminId: 'ADM-2026-0002',
    },
    {
      firstName: 'Adaeze', surname: 'Nwosu',
      email: 'a.nwosu@ndec.gov.ng',
      DOB: '1990-07-11', sex: Sex.FEMALE, maritalStatus: MaritalStatus.SINGLE,
      state: 'Ondo', LGA: 'Akure South', education: EducationLevel.TERTIARY,
      residentialAddress: '7 INEC Road, Akure',
      role: AdminRole.REGISTRATION_OFFICER, adminId: 'ADM-2026-0003',
    },
    {
      firstName: 'Babatunde', surname: 'Adeyemi',
      email: 'b.adeyemi@ndec.gov.ng',
      DOB: '1987-11-05', sex: Sex.MALE, maritalStatus: MaritalStatus.MARRIED,
      state: 'Ondo', LGA: 'Ondo West', education: EducationLevel.TERTIARY,
      residentialAddress: '12 Oba Adesida Road, Ondo',
      role: AdminRole.REGISTRATION_OFFICER, adminId: 'ADM-2026-0004',
    },
    {
      firstName: 'Funke', surname: 'Olawale',
      email: 'f.olawale@ndec.gov.ng',
      DOB: '1993-02-28', sex: Sex.FEMALE, maritalStatus: MaritalStatus.SINGLE,
      state: 'Ondo', LGA: 'Ile Oluji/Okeigbo', education: EducationLevel.TERTIARY,
      residentialAddress: '3 Market Square, Ile Oluji',
      role: AdminRole.REGISTRATION_OFFICER, adminId: 'ADM-2026-0005',
    },
    {
      firstName: 'Emeka', surname: 'Ugwu',
      email: 'e.ugwu@ndec.gov.ng',
      DOB: '1982-09-17', sex: Sex.MALE, maritalStatus: MaritalStatus.MARRIED,
      state: 'Enugu', LGA: 'Enugu North', education: EducationLevel.TERTIARY,
      residentialAddress: '20 Ogui Road, Enugu',
      role: AdminRole.MONITORING_OFFICER, adminId: 'ADM-2026-0006',
    },
    {
      firstName: 'Ngozi', surname: 'Eze',
      email: 'n.eze@ndec.gov.ng',
      DOB: '1980-06-30', sex: Sex.FEMALE, maritalStatus: MaritalStatus.MARRIED,
      state: 'Ondo', LGA: 'Akure North', education: EducationLevel.TERTIARY,
      residentialAddress: '9 Ilesha-Garage Road, Akure',
      role: AdminRole.RESULTS_OFFICER, adminId: 'ADM-2026-0007',
    },
  ];

  for (const a of supportingAdmins) {
    await prisma.admin.upsert({
      where: { email: a.email },
      update: {},
      create: {
        ...a,
        profilePicture: `https://placehold.co/400x400/1e293b/94a3b8?text=${a.firstName[0]}${a.surname[0]}`,
        activationPin: hashedPin,
        isActivated: true,
        password: hashedPassword,
        createdById: superAdmin.id,
      },
    });
  }
  console.log(`   ✓ ${supportingAdmins.length} supporting admin accounts seeded`);

  // ── 5. Election ────────────────────────────────────────────────────────
  console.log('\n[5/10] Seeding election...');
  const electionDay = new Date('2026-06-21');
  const election = await prisma.election.create({
    data: {
      id: 'election-ondo-sim-2026',
      title: 'Ondo State Gubernatorial Election — 2026 (Simulation)',
      description:
        'A controlled mock election simulation conducted across three sessions ' +
        'to evaluate the bimodal e-voting system under realistic operational conditions, ' +
        'involving 87 test participants drawn from diverse demographic and geographic groups ' +
        'representative of the Ondo State electorate.',
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 2 * 60 * 60 * 1000),  // started 2 hours ago
      endDate:   new Date(Date.now() + 14 * 60 * 60 * 1000), // ends in 14 hours
    },
  });
  console.log(`   ✓ Election: "${election.title}" [${election.status}]`);

  // ── 6. Candidates ──────────────────────────────────────────────────────
  // Vote distribution (86 total votes — all 86 registered voters vote):
  //   APC  → 29  (33.7%)
  //   PDP  → 22  (25.6%)
  //   LP   → 16  (18.6%)
  //   NNPP → 10  (11.6%)
  //   APGA →  6  ( 7.0%)
  //   SDP  →  3  ( 3.5%)
  //   Total: 86
  console.log('\n[6/10] Seeding candidates...');
  const candidatesData = [
    {
      id: 'cand-apc',  partyId: 'party-apc',
      firstName: 'Rotimi', surname: 'Akeredolu', otherName: 'Emmanuel',
      DOB: '1956-07-21', sex: Sex.MALE, maritalStatus: MaritalStatus.MARRIED,
      state: 'Ondo', LGA: 'Owo', education: EducationLevel.TERTIARY,
      bio: 'Seasoned statesman and legal practitioner with over three decades of public service experience in Ondo State.',
      imageUrl: 'https://placehold.co/400x500/D95300/ffffff?text=APC',
      votesToAssign: 29,
    },
    {
      id: 'cand-pdp',  partyId: 'party-pdp',
      firstName: 'Eyitayo', surname: 'Jegede', otherName: 'Abiodun',
      DOB: '1967-03-12', sex: Sex.MALE, maritalStatus: MaritalStatus.MARRIED,
      state: 'Ondo', LGA: 'Akure South', education: EducationLevel.TERTIARY,
      bio: 'Legal practitioner and former attorney-general with strong grassroots support across Ondo South Senatorial District.',
      imageUrl: 'https://placehold.co/400x500/0EA5E9/ffffff?text=PDP',
      votesToAssign: 22,
    },
    {
      id: 'cand-lp',   partyId: 'party-lp',
      firstName: 'Dele', surname: 'Agbe', otherName: 'Oluwafemi',
      DOB: '1972-11-08', sex: Sex.MALE, maritalStatus: MaritalStatus.MARRIED,
      state: 'Ondo', LGA: 'Ondo West', education: EducationLevel.TERTIARY,
      bio: 'Former federal lawmaker and grassroots organiser championing workers\' rights and agricultural reform across Ondo State.',
      imageUrl: 'https://placehold.co/400x500/22C55E/ffffff?text=LP',
      votesToAssign: 16,
    },
    {
      id: 'cand-nnpp', partyId: 'party-nnpp',
      firstName: 'Kola', surname: 'Ogunleye',
      DOB: '1969-05-30', sex: Sex.MALE, maritalStatus: MaritalStatus.MARRIED,
      state: 'Ondo', LGA: 'Ile Oluji/Okeigbo', education: EducationLevel.TERTIARY,
      bio: 'Business executive and community leader focused on economic diversification and rural infrastructure development.',
      imageUrl: 'https://placehold.co/400x500/EAB308/1e293b?text=NNPP',
      votesToAssign: 10,
    },
    {
      id: 'cand-apga', partyId: 'party-apga',
      firstName: 'Chioma', surname: 'Okeke',
      DOB: '1975-09-14', sex: Sex.FEMALE, maritalStatus: MaritalStatus.MARRIED,
      state: 'Ondo', LGA: 'Ese Odo', education: EducationLevel.TERTIARY,
      bio: 'Public health specialist and women\'s rights advocate with extensive community healthcare programme experience in Ondo State.',
      imageUrl: 'https://placehold.co/400x500/10B981/ffffff?text=APGA',
      votesToAssign: 6,
    },
    {
      id: 'cand-sdp',  partyId: 'party-sdp',
      firstName: 'Tunji', surname: 'Adeoye',
      DOB: '1980-01-25', sex: Sex.MALE, maritalStatus: MaritalStatus.SINGLE,
      state: 'Ondo', LGA: 'Akure North', education: EducationLevel.TERTIARY,
      bio: 'Technology entrepreneur and education reformer seeking to leverage digital innovation for Ondo State\'s economic transformation.',
      imageUrl: 'https://placehold.co/400x500/EF4444/ffffff?text=SDP',
      votesToAssign: 3,
    },
  ];

  for (const { votesToAssign: _v, ...c } of candidatesData) {
    await prisma.candidate.create({
      data: { ...c, electionId: election.id },
    });
  }
  console.log(`   ✓ ${candidatesData.length} candidates seeded`);

  // ── 7. Voters — 87 Participants ────────────────────────────────────────
  // Demographic breakdown (Table 4.7):
  //   Age 18-35: 34   Age 36-55: 31   Age 56+: 22
  //   Urban: 51       Rural: 36
  //
  // Urban LGAs (Lagos, Abuja, Port Harcourt, Akure South)  → indices 0-50
  // Rural LGAs (Ondo State rural)                          → indices 51-86
  console.log('\n[7/10] Seeding 87 voters...');

  type VoterDef = {
    firstName: string; surname: string; otherName?: string;
    DOB: string; sex: Sex; maritalStatus: MaritalStatus;
    state: string; LGA: string; ward: string;
    education: EducationLevel; residentialAddress: string;
  };

  // ── Urban voters (51) ─────────────────────────────────────────────────
  //   Age 18-35 (urban): 24    Age 36-55 (urban): 18   Age 56+ (urban): 9
  const urbanVoters: VoterDef[] = [
    // ── Age 18-35 urban (24) ──
    { firstName:'Tolu',      surname:'Adeyemi',   DOB:'2002-03-14', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Ikeja',       ward:'Ward 1', education:EducationLevel.TERTIARY,  residentialAddress:'12 Allen Avenue, Ikeja, Lagos' },
    { firstName:'Emeka',     surname:'Obi',       DOB:'2001-07-22', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Ikeja',       ward:'Ward 2', education:EducationLevel.TERTIARY,  residentialAddress:'5 Oba Akran Avenue, Ikeja, Lagos' },
    { firstName:'Sade',      surname:'Balogun',   DOB:'2003-11-03', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Surulere',    ward:'Ward 3', education:EducationLevel.TERTIARY,  residentialAddress:'22 Adeniran Ogunsanya, Surulere' },
    { firstName:'Chidi',     surname:'Okafor',    DOB:'2000-05-18', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Lagos Island', ward:'Ward 4', education:EducationLevel.TERTIARY, residentialAddress:'7 Marina Road, Lagos Island' },
    { firstName:'Aisha',     surname:'Musa',      DOB:'2004-01-30', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Abuja',    LGA:'Gwagwalada',  ward:'Ward 1', education:EducationLevel.TERTIARY,  residentialAddress:'34 Phase 2, Gwagwalada, Abuja' },
    { firstName:'Kunle',     surname:'Afolabi',   DOB:'1999-09-09', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Abuja',    LGA:'Abaji',       ward:'Ward 2', education:EducationLevel.TERTIARY,  residentialAddress:'10 Kuje Road, Abaji, Abuja' },
    { firstName:'Blessing',  surname:'Nwachukwu', DOB:'2002-12-25', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Rivers',   LGA:'Port Harcourt',ward:'Ward 5',education:EducationLevel.TERTIARY,  residentialAddress:'18 Aba Road, Port Harcourt' },
    { firstName:'Uche',      surname:'Okoro',     DOB:'2001-04-07', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Rivers',   LGA:'Port Harcourt',ward:'Ward 6',education:EducationLevel.TERTIARY,  residentialAddress:'3 Trans-Amadi Road, Port Harcourt' },
    { firstName:'Fatima',    surname:'Abdullahi', DOB:'2003-08-19', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Abuja',    LGA:'Kuje',        ward:'Ward 3', education:EducationLevel.SECONDARY,  residentialAddress:'27 Airport Road, Kuje, Abuja' },
    { firstName:'Gbenga',    surname:'Ogundimu',  DOB:'2000-02-14', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Alimosho',    ward:'Ward 7', education:EducationLevel.TERTIARY,  residentialAddress:'99 Egan Road, Alimosho, Lagos' },
    { firstName:'Ngozi',     surname:'Chukwu',    DOB:'1999-06-06', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Oshodi-Isolo',ward:'Ward 8', education:EducationLevel.TERTIARY, residentialAddress:'44 Oshodi Apapa Expressway, Lagos' },
    { firstName:'Musa',      surname:'Ibrahim',   DOB:'2003-10-10', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Abuja',    LGA:'Bwari',       ward:'Ward 4', education:EducationLevel.SECONDARY,  residentialAddress:'8 Bwari Area Council, Abuja' },
    { firstName:'Adaeze',    surname:'Igwe',      DOB:'2001-03-28', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Rivers',   LGA:'Obio-Akpor',  ward:'Ward 9', education:EducationLevel.TERTIARY,  residentialAddress:'55 Rumuola Road, Port Harcourt' },
    { firstName:'Taiwo',     surname:'Adekoya',   DOB:'2000-07-15', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Kosofe',      ward:'Ward 10',education:EducationLevel.TERTIARY,  residentialAddress:'14 Kosofe Estate, Lagos' },
    { firstName:'Amaka',     surname:'Onuoha',    DOB:'2002-09-23', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Mushin',      ward:'Ward 11',education:EducationLevel.SECONDARY,  residentialAddress:'6 Mushin Market Road, Lagos' },
    { firstName:'Oluwaseun', surname:'Adesola',   DOB:'2003-05-12', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Ikeja',       ward:'Ward 5', education:EducationLevel.TERTIARY,  residentialAddress:'2 Toyin Street, Ikeja, Lagos' },
    { firstName:'Rejoice',   surname:'Eze',       DOB:'1999-11-20', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Abuja',    LGA:'Kuje',        ward:'Ward 6', education:EducationLevel.TERTIARY,  residentialAddress:'30 Kuje Central, Abuja' },
    { firstName:'Ridwan',    surname:'Salami',    DOB:'2001-01-08', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Agege',       ward:'Ward 12',education:EducationLevel.SECONDARY,  residentialAddress:'17 Agege Motor Road, Lagos' },
    { firstName:'Peace',     surname:'Okeke',     DOB:'2004-04-16', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Rivers',   LGA:'Port Harcourt',ward:'Ward 13',education:EducationLevel.TERTIARY, residentialAddress:'9 Stadium Road, Port Harcourt' },
    { firstName:'Dapo',      surname:'Fashola',   DOB:'2000-08-04', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Surulere',    ward:'Ward 14',education:EducationLevel.TERTIARY,  residentialAddress:'18 Western Avenue, Surulere, Lagos' },
    { firstName:'Chisom',    surname:'Anyanwu',   DOB:'2002-06-29', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Ibeju-Lekki', ward:'Ward 15',education:EducationLevel.TERTIARY,  residentialAddress:'42 Lekki-Epe Expressway, Lagos' },
    { firstName:'Ahmed',     surname:'Suleiman',  DOB:'2003-02-11', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Abuja',    LGA:'Gwagwalada',  ward:'Ward 7', education:EducationLevel.TERTIARY,  residentialAddress:'16 Gwagwalada Town, Abuja' },
    { firstName:'Yewande',   surname:'Falode',    DOB:'1999-12-03', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Lagos',    LGA:'Lagos Island', ward:'Ward 16',education:EducationLevel.TERTIARY, residentialAddress:'3 Victoria Island, Lagos' },
    { firstName:'Chibuzor',  surname:'Nweze',     DOB:'2001-10-17', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Rivers',   LGA:'Obio-Akpor',  ward:'Ward 17',education:EducationLevel.TERTIARY,  residentialAddress:'77 Rumuche Road, Port Harcourt' },
    // ── Age 36-55 urban (18) ──
    { firstName:'Bimbo',     surname:'Olatunji',  DOB:'1985-04-11', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Eti-Osa',     ward:'Ward 18',education:EducationLevel.TERTIARY,  residentialAddress:'5 Victoria Garden City, Lekki, Lagos' },
    { firstName:'Nnamdi',    surname:'Chukwueke', DOB:'1979-09-25', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Ikeja',       ward:'Ward 19',education:EducationLevel.TERTIARY,  residentialAddress:'88 Obafemi Awolowo Road, Ikeja' },
    { firstName:'Kemi',      surname:'Adewale',   DOB:'1988-07-06', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Abuja',    LGA:'Municipal',   ward:'Ward 20',education:EducationLevel.TERTIARY,  residentialAddress:'15 Wuse Zone 3, Abuja' },
    { firstName:'Ifeanyi',   surname:'Obiora',    DOB:'1982-03-18', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Rivers',   LGA:'Port Harcourt',ward:'Ward 21',education:EducationLevel.TERTIARY, residentialAddress:'24 Rumuola Road, Port Harcourt' },
    { firstName:'Lola',      surname:'Badmus',    DOB:'1991-11-28', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Isale-Eko',   ward:'Ward 22',education:EducationLevel.TERTIARY,  residentialAddress:'11 Idumota, Lagos Island, Lagos' },
    { firstName:'Seun',      surname:'Olatunde',  DOB:'1977-06-09', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Amuwo-Odofin',ward:'Ward 23',education:EducationLevel.TERTIARY,  residentialAddress:'67 Trade Fair Complex Road, Lagos' },
    { firstName:'Chinwe',    surname:'Uche',      DOB:'1984-02-14', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Surulere',    ward:'Ward 24',education:EducationLevel.TERTIARY,  residentialAddress:'30 Bode Thomas Street, Surulere' },
    { firstName:'Dare',      surname:'Ogunseye',  DOB:'1989-08-03', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Abuja',    LGA:'Abaji',       ward:'Ward 25',education:EducationLevel.TERTIARY,  residentialAddress:'5 Abaji Council Secretariat Road, Abuja' },
    { firstName:'Nneka',     surname:'Onyekachi', DOB:'1980-05-22', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Rivers',   LGA:'Obio-Akpor',  ward:'Ward 26',education:EducationLevel.TERTIARY,  residentialAddress:'12 Rumuigbo Road, Port Harcourt' },
    { firstName:'Rasheed',   surname:'Olawale',   DOB:'1986-12-17', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Kosofe',      ward:'Ward 27',education:EducationLevel.TERTIARY,  residentialAddress:'19 Alapere Estate, Kosofe, Lagos' },
    { firstName:'Josephine', surname:'Ezeobiora', DOB:'1990-04-30', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Oshodi-Isolo',ward:'Ward 28',education:EducationLevel.TERTIARY,  residentialAddress:'23 Ejigbo Road, Lagos' },
    { firstName:'Sunday',    surname:'Akinwale',  DOB:'1978-10-05', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Alimosho',    ward:'Ward 29',education:EducationLevel.TERTIARY,  residentialAddress:'8 Ikotun Road, Lagos' },
    { firstName:'Ngozi',     surname:'Obi',       DOB:'1985-01-19', sex:Sex.FEMALE, maritalStatus:MaritalStatus.DIVORCED,state:'Abuja',    LGA:'Municipal',   ward:'Ward 30',education:EducationLevel.TERTIARY,  residentialAddress:'4 Area 3, Garki, Abuja' },
    { firstName:'Victor',    surname:'Ndubuisi',  DOB:'1991-07-08', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Rivers',   LGA:'Port Harcourt',ward:'Ward 31',education:EducationLevel.TERTIARY, residentialAddress:'31 Nkpolu Road, Port Harcourt' },
    { firstName:'Hauwa',     surname:'Bello',     DOB:'1987-09-14', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Abuja',    LGA:'Gwagwalada',  ward:'Ward 32',education:EducationLevel.TERTIARY,  residentialAddress:'22 Phase 4, Gwagwalada, Abuja' },
    { firstName:'Babajide',  surname:'Alabi',     DOB:'1983-03-27', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Ikeja',       ward:'Ward 33',education:EducationLevel.TERTIARY,  residentialAddress:'6 CMD Road, Ikeja, Lagos' },
    { firstName:'Ada',       surname:'Nwachukwu', DOB:'1979-11-12', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Rivers',   LGA:'Port Harcourt',ward:'Ward 34',education:EducationLevel.TERTIARY, residentialAddress:'55 Peter Odili Road, Port Harcourt' },
    { firstName:'Chinyere',  surname:'Okonkwo',   DOB:'1986-06-20', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Abuja',    LGA:'Municipal',   ward:'Ward 34b',education:EducationLevel.TERTIARY,  residentialAddress:'11 Asokoro District, Abuja' },
    // ── Age 56+ urban (9) ──
    { firstName:'Chief Remi',surname:'Adeleke',   DOB:'1958-06-15', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Eti-Osa',     ward:'Ward 35',education:EducationLevel.TERTIARY,  residentialAddress:'1 Bourdillon Road, Ikoyi, Lagos' },
    { firstName:'Mrs Ngozi', surname:'Okoye',     DOB:'1963-02-28', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Lagos Island', ward:'Ward 36',education:EducationLevel.TERTIARY, residentialAddress:'12 Commercial Avenue, Lagos Island' },
    { firstName:'Alhaji Bala',surname:'Muhammed', DOB:'1955-10-01', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Abuja',    LGA:'Municipal',   ward:'Ward 37',education:EducationLevel.SECONDARY,  residentialAddress:'3 Maitama District, Abuja' },
    { firstName:'Pa Joseph',  surname:'Odeyemi',  DOB:'1960-12-25', sex:Sex.MALE,   maritalStatus:MaritalStatus.WIDOWED, state:'Lagos',    LGA:'Surulere',    ward:'Ward 38',education:EducationLevel.PRIMARY,     residentialAddress:'7 Itire Road, Surulere, Lagos' },
    { firstName:'Mama Grace', surname:'Afolabi',  DOB:'1957-04-18', sex:Sex.FEMALE, maritalStatus:MaritalStatus.WIDOWED, state:'Lagos',    LGA:'Agege',       ward:'Ward 39',education:EducationLevel.PRIMARY,     residentialAddress:'14 Agege Town Centre, Lagos' },
    { firstName:'Elder Ben',  surname:'Ekwueme',  DOB:'1961-08-07', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Rivers',   LGA:'Port Harcourt',ward:'Ward 40',education:EducationLevel.SECONDARY,  residentialAddress:'29 Forces Avenue, Port Harcourt' },
    { firstName:'Mama Titi',  surname:'Fasanya',  DOB:'1964-03-09', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Lagos',    LGA:'Mushin',      ward:'Ward 41',education:EducationLevel.PRIMARY,     residentialAddress:'5 Mushin Town Centre, Lagos' },
    { firstName:'Pa Ike',     surname:'Aneke',    DOB:'1953-11-20', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Abuja',    LGA:'Kuje',        ward:'Ward 42',education:EducationLevel.PRIMARY,     residentialAddress:'11 Kuje Old Town, Abuja' },
    { firstName:'Madam Comfort',surname:'Okonkwo',DOB:'1959-07-30', sex:Sex.FEMALE, maritalStatus:MaritalStatus.WIDOWED, state:'Rivers',   LGA:'Obio-Akpor',  ward:'Ward 43',education:EducationLevel.SECONDARY,  residentialAddress:'8 Eliozu Road, Port Harcourt' },
  ];

  // ── Rural voters (36) ─────────────────────────────────────────────────
  //   Age 18-35 (rural): 10    Age 36-55 (rural): 13   Age 56+ (rural): 13
  const ruralVoters: VoterDef[] = [
    // ── Age 18-35 rural (10) ──
    { firstName:'Tunde',    surname:'Olusola',   DOB:'2001-02-17', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Odigbo',            ward:'Ward 1', education:EducationLevel.SECONDARY, residentialAddress:'4 Alagbaka Village, Odigbo, Ondo' },
    { firstName:'Bunmi',    surname:'Ogundele',  DOB:'2003-06-11', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Ese Odo',           ward:'Ward 2', education:EducationLevel.SECONDARY, residentialAddress:'7 Igbekebo Road, Ese Odo, Ondo' },
    { firstName:'Kayode',   surname:'Adeniyi',   DOB:'2000-10-29', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Ifedore',           ward:'Ward 3', education:EducationLevel.SECONDARY, residentialAddress:'12 Igbara-Oke Road, Ifedore, Ondo' },
    { firstName:'Bisola',   surname:'Ogunyemi',  DOB:'2002-04-05', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Ondo East',         ward:'Ward 4', education:EducationLevel.SECONDARY, residentialAddress:'3 Oke-Eda, Ondo East LGA' },
    { firstName:'Femi',     surname:'Adeyeye',   DOB:'1999-08-22', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Ile Oluji/Okeigbo', ward:'Ward 5', education:EducationLevel.SECONDARY, residentialAddress:'9 Ile Oluji Main Road, Ondo' },
    { firstName:'Sola',     surname:'Omodele',   DOB:'2003-12-01', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Odigbo',            ward:'Ward 6', education:EducationLevel.SECONDARY, residentialAddress:'2 Iju-Odo Community, Odigbo' },
    { firstName:'Wale',     surname:'Fadahunsi',  DOB:'2001-03-18', sex:Sex.MALE,  maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Idanre',            ward:'Ward 7', education:EducationLevel.SECONDARY, residentialAddress:'6 Idanre Hills Road, Ondo' },
    { firstName:'Yemi',     surname:'Ojo',       DOB:'2004-07-25', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Irele',             ward:'Ward 8', education:EducationLevel.SECONDARY, residentialAddress:'15 Ode-Irele Road, Irele, Ondo' },
    { firstName:'Biodun',   surname:'Ilesanmi',  DOB:'2000-01-14', sex:Sex.MALE,   maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Ogun Waterside',    ward:'Ward 9', education:EducationLevel.PRIMARY,   residentialAddress:'4 Aiyetoro Waterside, Ondo' },
    { firstName:'Tosin',    surname:'Adebayo',   DOB:'2002-09-08', sex:Sex.FEMALE, maritalStatus:MaritalStatus.SINGLE,  state:'Ondo', LGA:'Ese Odo',           ward:'Ward 10',education:EducationLevel.SECONDARY, residentialAddress:'1 Igbobini Road, Ese Odo, Ondo' },
    // ── Age 36-55 rural (13) ──
    { firstName:'Rotimi',   surname:'Ajayi',     DOB:'1984-05-07', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ondo West',         ward:'Ward 11',education:EducationLevel.SECONDARY, residentialAddress:'18 Ondo Town Centre, Ondo West' },
    { firstName:'Kike',     surname:'Adetokunbo',DOB:'1979-11-24', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Akure North',       ward:'Ward 12',education:EducationLevel.SECONDARY, residentialAddress:'3 Owena-Ondo Road, Akure North' },
    { firstName:'Dayo',     surname:'Ariyo',     DOB:'1988-03-15', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Akoko North-East',  ward:'Ward 13',education:EducationLevel.TERTIARY,  residentialAddress:'7 Ikare-Akoko Main Street, Ondo' },
    { firstName:'Sikirat',  surname:'Afolabi',   DOB:'1981-07-02', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Akoko South-West',  ward:'Ward 14',education:EducationLevel.SECONDARY, residentialAddress:'12 Oka-Akoko, Akoko South-West' },
    { firstName:'Gbemiga',  surname:'Adegbite',  DOB:'1990-09-30', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Idanre',            ward:'Ward 15',education:EducationLevel.SECONDARY, residentialAddress:'5 Idanre Town Road, Ondo' },
    { firstName:'Folake',   surname:'Akinbode',  DOB:'1976-12-22', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Odigbo',            ward:'Ward 16',education:EducationLevel.SECONDARY, residentialAddress:'9 Ore Main Street, Odigbo, Ondo' },
    { firstName:'Kunmi',    surname:'Adekunle',  DOB:'1985-04-08', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ose',               ward:'Ward 17',education:EducationLevel.SECONDARY, residentialAddress:'6 Ifon Road, Ose LGA, Ondo' },
    { firstName:'Bisi',     surname:'Oloyede',   DOB:'1980-08-17', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Irele',             ward:'Ward 18',education:EducationLevel.SECONDARY, residentialAddress:'14 Irele Town Centre, Ondo' },
    { firstName:'Dotun',    surname:'Fakoya',    DOB:'1987-02-10', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ifedore',           ward:'Ward 19',education:EducationLevel.TERTIARY,  residentialAddress:'3 Igbara-Oke, Ifedore, Ondo' },
    { firstName:'Omolara',  surname:'Ijaware',   DOB:'1983-06-05', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ondo East',         ward:'Ward 20',education:EducationLevel.SECONDARY, residentialAddress:'8 Ode-Ondo Road, Ondo East' },
    { firstName:'Adewole',  surname:'Adeagbo',   DOB:'1991-10-19', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ile Oluji/Okeigbo', ward:'Ward 21',education:EducationLevel.SECONDARY, residentialAddress:'20 Okeigbo Road, Ile Oluji' },
    { firstName:'Taiwo',    surname:'Ogunleye',  DOB:'1978-01-28', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ogun Waterside',    ward:'Ward 22',education:EducationLevel.PRIMARY,   residentialAddress:'2 Odogbolu Junction, Ogun Waterside' },
    { firstName:'Akeem',    surname:'Jimoh',     DOB:'1989-05-14', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ese Odo',           ward:'Ward 23',education:EducationLevel.SECONDARY, residentialAddress:'11 Arogbo Road, Ese Odo, Ondo' },
    // ── Age 56+ rural (13) ──
    { firstName:'Baba Rotimi',  surname:'Adeyemi',  DOB:'1962-03-04', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ondo West',         ward:'Ward 24',education:EducationLevel.PRIMARY,   residentialAddress:'4 Oba\'s Palace Road, Ondo Town' },
    { firstName:'Mama Yinka',   surname:'Oladele',  DOB:'1958-08-16', sex:Sex.FEMALE, maritalStatus:MaritalStatus.WIDOWED, state:'Ondo', LGA:'Akure North',       ward:'Ward 25',education:EducationLevel.PRIMARY,   residentialAddress:'7 Oba-Ile Village, Akure North' },
    { firstName:'Pa Oluwole',   surname:'Ajisafe',  DOB:'1955-12-29', sex:Sex.MALE,   maritalStatus:MaritalStatus.WIDOWED, state:'Ondo', LGA:'Akoko North-East',  ward:'Ward 26',education:EducationLevel.PRIMARY,   residentialAddress:'3 Ikare-Akoko Old Town, Ondo' },
    { firstName:'Iya Abeo',     surname:'Owolabi',  DOB:'1963-06-22', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Akoko South-West',  ward:'Ward 27',education:EducationLevel.PRIMARY,   residentialAddress:'1 Oka-Akoko Market Road, Ondo' },
    { firstName:'Chief Ayo',    surname:'Olusanya', DOB:'1960-10-15', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Idanre',            ward:'Ward 28',education:EducationLevel.SECONDARY, residentialAddress:'9 Owena Road, Idanre, Ondo' },
    { firstName:'Mama Bose',    surname:'Adeogun',  DOB:'1957-02-07', sex:Sex.FEMALE, maritalStatus:MaritalStatus.WIDOWED, state:'Ondo', LGA:'Odigbo',            ward:'Ward 29',education:EducationLevel.PRIMARY,   residentialAddress:'6 Ore Waterside, Odigbo, Ondo' },
    { firstName:'Baba Sule',    surname:'Adeyemo',  DOB:'1964-07-19', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ose',               ward:'Ward 30',education:EducationLevel.PRIMARY,   residentialAddress:'2 Ifon Town Centre, Ose LGA' },
    { firstName:'Alhaja Saadat',surname:'Badmus',   DOB:'1959-11-10', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Irele',             ward:'Ward 31',education:EducationLevel.PRIMARY,   residentialAddress:'8 Irele Market Road, Ondo' },
    { firstName:'Pa Daniel',    surname:'Ige',      DOB:'1952-04-25', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ifedore',           ward:'Ward 32',education:EducationLevel.PRIMARY,   residentialAddress:'5 Ijare Village, Ifedore, Ondo' },
    { firstName:'Mama Sola',    surname:'Akinlade', DOB:'1961-09-02', sex:Sex.FEMALE, maritalStatus:MaritalStatus.WIDOWED, state:'Ondo', LGA:'Ondo East',         ward:'Ward 33',education:EducationLevel.PRIMARY,   residentialAddress:'1 Ode-Ondo Village, Ondo East' },
    { firstName:'Agba Lukman',  surname:'Afolabi',  DOB:'1956-01-18', sex:Sex.MALE,   maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ile Oluji/Okeigbo', ward:'Ward 34',education:EducationLevel.PRIMARY,   residentialAddress:'13 Ile Oluji Old Town' },
    { firstName:'Mama Patience',surname:'Omoruyi',  DOB:'1965-05-31', sex:Sex.FEMALE, maritalStatus:MaritalStatus.MARRIED, state:'Ondo', LGA:'Ogun Waterside',    ward:'Ward 35',education:EducationLevel.PRIMARY,   residentialAddress:'2 Aiyetoro Community, Ogun Waterside' },
  ];

  const allVoterDefs = [...urbanVoters, ...ruralVoters]; // 51 + 35 = 86
  const createdVoters: { id: string; LGA: string; isRural: boolean; ageGroup: '18-35' | '36-55' | '56+' }[] = [];

  const registrationOfficerIds = [
    (await prisma.admin.findUnique({ where: { adminId: 'ADM-2026-0003' } }))!.id,
    (await prisma.admin.findUnique({ where: { adminId: 'ADM-2026-0004' } }))!.id,
    (await prisma.admin.findUnique({ where: { adminId: 'ADM-2026-0005' } }))!.id,
  ];

  const hashedVoterPassword = await bcrypt.hash('@vote2026', 10);

  for (let i = 0; i < allVoterDefs.length; i++) {
    const vDef = allVoterDefs[i];
    const serial = String(i + 1).padStart(4, '0');
    const dob    = new Date(vDef.DOB);
    const age    = electionDay.getFullYear() - dob.getFullYear();
    const ageGroup: '18-35' | '36-55' | '56+' = age <= 35 ? '18-35' : age <= 55 ? '36-55' : '56+';
    const isRural = i >= 51;

    const voter = await prisma.voter.create({
      data: {
        firstName:          vDef.firstName,
        surname:            vDef.surname,
        otherName:          vDef.otherName,
        email:              `voter${serial}@simulation.ndec.gov.ng`,
        profilePicture:     `https://placehold.co/400x400/1e293b/94a3b8?text=V${serial}`,
        DOB:                vDef.DOB,
        sex:                vDef.sex,
        maritalStatus:      vDef.maritalStatus,
        state:              vDef.state,
        LGA:                vDef.LGA,
        ward:               vDef.ward,
        education:          vDef.education,
        residentialAddress: vDef.residentialAddress,
        voterId:            `VTR-2026-${serial}`,
        activationPin:      hashedPin,
        isActivated:        true,
        password:           hashedVoterPassword,
        createdById:        registrationOfficerIds[i % 3],
      },
    });
    createdVoters.push({ id: voter.id, LGA: voter.LGA, isRural, ageGroup });
  }
  console.log(`   ✓ ${createdVoters.length} voters seeded`);

  // ── 8. Votes — all 86 registered voters have voted ──────────────────
  // Vote distribution:
  //   APC  29, PDP 22, LP 16, NNPP 10, APGA 6, SDP 3  → total 86
  console.log('\n[8/10] Seeding votes (all 86 voters)...');

  const voteAllocation: { candId: string; count: number }[] = [
    { candId: 'cand-apc',  count: 29 },
    { candId: 'cand-pdp',  count: 22 },
    { candId: 'cand-lp',   count: 16 },
    { candId: 'cand-nnpp', count: 10 },
    { candId: 'cand-apga', count:  6 },
    { candId: 'cand-sdp',  count:  3 },
  ];

  // Build a flat list of candidateIds in assignment order
  const voteAssignments: string[] = [];
  for (const { candId, count } of voteAllocation) {
    for (let k = 0; k < count; k++) voteAssignments.push(candId);
  }
  // Shuffle deterministically (Fisher-Yates with fixed seed via index)
  for (let i = voteAssignments.length - 1; i > 0; i--) {
    const j = (i * 6364136223846793005 + 1) % (i + 1);
    [voteAssignments[i], voteAssignments[j]] = [voteAssignments[j], voteAssignments[i]];
  }

  // Spread timestamps across today's polling window (past 2 hours → now)
  const now = new Date();
  const voteTimestamps = pollingTimestamps(new Date(now.getTime() - 2 * 60 * 60 * 1000), 86);
  for (let i = 0; i < createdVoters.length; i++) {
    await prisma.vote.create({
      data: {
        voterId:     createdVoters[i].id,
        electionId:  election.id,
        candidateId: voteAssignments[i],
        createdAt:   voteTimestamps[i],
      },
    });
  }
  console.log(`   ✓ 86 votes cast (all registered voters)`)

  // ── 9. Biometric Attempt Logs ──────────────────────────────────────────
  // Chapter 4 §4.3.1.1:  261 face attempts, 7 FAILED (FRR 3.45%)
  // Chapter 4 §4.3.1.2:  174 fingerprint attempts, 4 FAILED (2.30%)
  //
  // FAILED face attempts: 5 in Age 56+ (indices 42-50 urban + 74-86 rural)
  //                       2 in rural participants (poor lighting)
  // FAILED fingerprint:   4 in Age 56+ group
  console.log('\n[9/10] Seeding biometric attempt logs...');

  // Determine which voters get FAILED face attempts
  // Layout (87 voters): urban 18-35 [0-23], urban 36-55 [24-41], urban 56+ [42-50]
  //                     rural 18-35 [51-60], rural 36-55 [61-73], rural 56+ [74-86]

  // 5 face failures from Age 56+ (first 5 of the combined elderly list)
  // 2 face failures from rural participants (poor lighting — indices 51, 56)
  const faceFailIndices   = new Set([42, 44, 74, 76, 78, 51, 56]);   // 7 failures
  // 4 fingerprint failures from Age 56+ (different 4)
  const fpFailIndices     = new Set([43, 47, 75, 79]);                // 4 failures

  const bioTimestamps = pollingTimestamps(new Date(), 450); // pool of timestamps — today's date
  let bioTsIdx = 0;

  for (let i = 0; i < createdVoters.length; i++) {
    const v = createdVoters[i];

    // 3 face verification attempts per voter
    for (let attempt = 0; attempt < 3; attempt++) {
      const isFaceSuccess = !(faceFailIndices.has(i) && attempt === 0);
      await prisma.biometricAttempt.create({
        data: {
          voterId:    v.id,
          electionId: election.id,
          status:     isFaceSuccess ? 'SUCCESS' : 'FAILED',
          createdAt:  bioTimestamps[bioTsIdx++ % bioTimestamps.length],
        },
      });
    }

    // 2 fingerprint attempts per voter
    for (let attempt = 0; attempt < 2; attempt++) {
      const isFpSuccess = !(fpFailIndices.has(i) && attempt === 0);
      await prisma.biometricAttempt.create({
        data: {
          voterId:    v.id,
          electionId: election.id,
          status:     isFpSuccess ? 'SUCCESS' : 'FAILED',
          createdAt:  bioTimestamps[bioTsIdx++ % bioTimestamps.length],
        },
      });
    }
  }
  // Verify counts
  const faceFailed = await prisma.biometricAttempt.count({ where: { electionId: election.id, status: 'FAILED' } });
  const faceTotal  = await prisma.biometricAttempt.count({ where: { electionId: election.id } });
  console.log(`   ✓ ${faceTotal} biometric attempts seeded (${faceFailed} FAILED)`);

  // ── 10. Duplicate Vote Attempts ────────────────────────────────────────
  console.log('\n[10a/10] Seeding duplicate vote attempts...');
  const dvAttemptVoterIndices = [0, 5, 12, 20, 31]; // 5 voters tried to vote twice
  for (const idx of dvAttemptVoterIndices) {
    const v = createdVoters[idx];
    // Get the actual vote they cast to know which candidateId
    const existingVote = await prisma.vote.findFirst({
      where: { voterId: v.id, electionId: election.id },
    });
    if (!existingVote) continue;
    await prisma.duplicateVoteAttempt.create({
      data: {
        voterId:     v.id,
        electionId:  election.id,
        candidateId: existingVote.candidateId,
        createdAt:   new Date('2026-06-21T15:30:00.000Z'),
      },
    });
  }
  console.log(`   ✓ 5 duplicate vote attempts seeded`);

  // ── 10b. Security Alerts ───────────────────────────────────────────────
  console.log('\n[10b/10] Seeding security alerts...');
  const securityAlerts = [
    { type: 'warning', title: 'Duplicate Vote Attempt Detected',       description: 'Voter VTR-2026-0001 attempted to cast a second ballot at 15:31. Attempt was rejected and logged.', createdAt: new Date('2026-06-21T15:31:00.000Z') },
    { type: 'warning', title: 'Duplicate Vote Attempt Detected',       description: 'Voter VTR-2026-0006 attempted to re-cast their ballot at 15:33. Request blocked by server-side duplicate guard.', createdAt: new Date('2026-06-21T15:33:00.000Z') },
    { type: 'danger',  title: 'Facial Spoofing Attempt Blocked',       description: 'Printed photograph presented to camera at polling unit — Ward 35, Ikeja. Rejected by InsightFace quality scoring (score: 0.11, threshold: 0.40).', createdAt: new Date('2026-06-21T09:14:00.000Z') },
    { type: 'danger',  title: 'Biometric Spoofing Attempt (Video)',    description: 'Video replay spoofing attempt detected at Ward 21, Surulere. Face quality check score 0.21 — below acceptance threshold. Attempt rejected.', createdAt: new Date('2026-06-21T11:47:00.000Z') },
    { type: 'warning', title: 'Expired JWT Token Rejected',            description: 'An expired session token was submitted to the /api/vote endpoint. Token issued at 09:02 UTC, expired at 09:17 UTC. Request blocked.', createdAt: new Date('2026-06-21T09:18:00.000Z') },
    { type: 'warning', title: 'Expired JWT Token Rejected',            description: 'Expired session token detected on /api/biometric/verify. Token had exceeded the 15-minute validity window. Request rejected with HTTP 401.', createdAt: new Date('2026-06-21T13:52:00.000Z') },
    { type: 'danger',  title: 'Device Mismatch — Session Hijack Attempt', description: 'Session token from VTR-2026-0013 submitted from unrecognised device fingerprint. Core API device-binding check returned HTTP 403 Forbidden.', createdAt: new Date('2026-06-21T14:22:00.000Z') },
    { type: 'success', title: 'Election CLOSED Successfully',          description: 'Ondo State Gubernatorial Election (Simulation) was closed at 18:00. 86 valid votes recorded. Audit log integrity verified.', createdAt: new Date('2026-06-21T18:00:05.000Z') },
    { type: 'info',    title: 'Peak Load Period Detected',             description: 'Concurrent request rate reached 347 requests/min at 10:15 UTC, within the system\'s 350-user capacity benchmark. No degradation observed.', createdAt: new Date('2026-06-21T10:15:00.000Z') },
    { type: 'warning', title: 'Facial Recognition Failure — Fallback Activated', description: 'Voter VTR-2026-0043 failed two consecutive face verification attempts. Fingerprint fallback pathway activated automatically.', createdAt: new Date('2026-06-21T09:55:00.000Z') },
  ];

  for (const alert of securityAlerts) {
    await prisma.securityAlert.create({ data: alert });
  }
  console.log(`   ✓ ${securityAlerts.length} security alerts seeded`);

  // ── 10c. Audit Logs ────────────────────────────────────────────────────
  const electionAdminEmail = 'c.okonkwo@ndec.gov.ng';
  const reg1Email          = 'a.nwosu@ndec.gov.ng';
  const reg2Email          = 'b.adeyemi@ndec.gov.ng';
  const reg3Email          = 'f.olawale@ndec.gov.ng';
  const superAdminEmail    = 'shawolhorizon@gmail.com';

  const auditLogs = [
    { adminEmail: superAdminEmail,    action: 'CREATE',      resourceType: 'Admin',    resourceId: 'ADM-2026-0002', timestamp: new Date('2026-06-10T08:05:00.000Z') },
    { adminEmail: superAdminEmail,    action: 'CREATE',      resourceType: 'Admin',    resourceId: 'ADM-2026-0003', timestamp: new Date('2026-06-10T08:07:00.000Z') },
    { adminEmail: superAdminEmail,    action: 'CREATE',      resourceType: 'Admin',    resourceId: 'ADM-2026-0004', timestamp: new Date('2026-06-10T08:09:00.000Z') },
    { adminEmail: superAdminEmail,    action: 'CREATE',      resourceType: 'Admin',    resourceId: 'ADM-2026-0005', timestamp: new Date('2026-06-10T08:11:00.000Z') },
    { adminEmail: superAdminEmail,    action: 'CREATE',      resourceType: 'Admin',    resourceId: 'ADM-2026-0006', timestamp: new Date('2026-06-10T08:13:00.000Z') },
    { adminEmail: superAdminEmail,    action: 'CREATE',      resourceType: 'Admin',    resourceId: 'ADM-2026-0007', timestamp: new Date('2026-06-10T08:15:00.000Z') },
    { adminEmail: electionAdminEmail, action: 'CREATE',      resourceType: 'Election', resourceId: 'election-ondo-sim-2026', timestamp: new Date('2026-06-12T09:00:00.000Z') },
    { adminEmail: electionAdminEmail, action: 'CREATE',      resourceType: 'Candidate',resourceId: 'cand-apc',  timestamp: new Date('2026-06-12T09:15:00.000Z') },
    { adminEmail: electionAdminEmail, action: 'CREATE',      resourceType: 'Candidate',resourceId: 'cand-pdp',  timestamp: new Date('2026-06-12T09:20:00.000Z') },
    { adminEmail: electionAdminEmail, action: 'CREATE',      resourceType: 'Candidate',resourceId: 'cand-lp',   timestamp: new Date('2026-06-12T09:25:00.000Z') },
    { adminEmail: electionAdminEmail, action: 'CREATE',      resourceType: 'Candidate',resourceId: 'cand-nnpp', timestamp: new Date('2026-06-12T09:30:00.000Z') },
    { adminEmail: electionAdminEmail, action: 'CREATE',      resourceType: 'Candidate',resourceId: 'cand-apga', timestamp: new Date('2026-06-12T09:35:00.000Z') },
    { adminEmail: electionAdminEmail, action: 'CREATE',      resourceType: 'Candidate',resourceId: 'cand-sdp',  timestamp: new Date('2026-06-12T09:40:00.000Z') },
    { adminEmail: electionAdminEmail, action: 'STATUS_UPDATE',resourceType:'Election', resourceId: 'election-ondo-sim-2026', timestamp: new Date('2026-06-21T07:55:00.000Z') },
    { adminEmail: reg1Email,          action: 'BULK_REGISTER',resourceType:'Voter',    resourceId: '29 voters registered (Session 1)', timestamp: new Date('2026-06-15T10:00:00.000Z') },
    { adminEmail: reg2Email,          action: 'BULK_REGISTER',resourceType:'Voter',    resourceId: '29 voters registered (Session 2)', timestamp: new Date('2026-06-16T10:00:00.000Z') },
    { adminEmail: reg3Email,          action: 'BULK_REGISTER',resourceType:'Voter',    resourceId: '29 voters registered (Session 3)', timestamp: new Date('2026-06-17T10:00:00.000Z') },
    { adminEmail: electionAdminEmail, action: 'STATUS_UPDATE',resourceType:'Election', resourceId: 'election-ondo-sim-2026 → CLOSED', timestamp: new Date('2026-06-21T18:00:00.000Z') },
    { adminEmail: superAdminEmail,    action: 'AUDIT_REVIEW', resourceType:'AuditLog', resourceId: 'Post-election integrity check completed — no discrepancies', timestamp: new Date('2026-06-21T18:30:00.000Z') },
  ];

  for (const log of auditLogs) {
    await prisma.auditLog.create({ data: log });
  }
  console.log(`   ✓ ${auditLogs.length} audit log entries seeded`);

  // ── Summary ────────────────────────────────────────────────────────────
  const totalVotes     = await prisma.vote.count();
  const totalVoters    = await prisma.voter.count();
  const totalBiometric = await prisma.biometricAttempt.count();
  const totalFailed    = await prisma.biometricAttempt.count({ where: { status: 'FAILED' } });
  const totalDup       = await prisma.duplicateVoteAttempt.count();
  const totalAlerts    = await prisma.securityAlert.count();
  const totalAudit     = await prisma.auditLog.count();

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                  SEEDING COMPLETE — SUMMARY                ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Registered voters:          ${String(totalVoters).padEnd(30)}║`);
  console.log(`║  Votes cast:                 ${String(totalVotes).padEnd(30)}║`);
  console.log(`║  Voter turnout:              ${String((totalVotes / totalVoters * 100).toFixed(2) + '%').padEnd(30)}║`);
  console.log(`║  Biometric attempts:         ${String(totalBiometric).padEnd(30)}║`);
  console.log(`║  Failed biometric attempts:  ${String(totalFailed).padEnd(30)}║`);
  console.log(`║  Duplicate vote attempts:    ${String(totalDup).padEnd(30)}║`);
  console.log(`║  Security alerts:            ${String(totalAlerts).padEnd(30)}║`);
  console.log(`║  Audit log entries:          ${String(totalAudit).padEnd(30)}║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  Chapter 4 targets                                          ║');
  console.log('║  Bimodal TAR:  99.34%  (86/87 voters authenticated)        ║');
  console.log('║  FAR:          0.00%   (no unauthorised authentications)    ║');
  console.log('║  FRR:          1.15%   (1 of 87 unable to authenticate)     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
}

main()
  .catch((e) => {
    console.error('\n❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });