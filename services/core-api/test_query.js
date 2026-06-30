import { prisma } from './src/lib/prisma.js';

async function test() {
  try {
    const queryId = 'VT-VTO-63121';
    const user = await prisma.voter.findUnique({
      where: { voterId: queryId }
    });
    console.log('Query ID:', queryId);
    console.log('Result:', user ? 'Voter Found!' : 'Voter Not Found!');
    if (user) {
      console.log('Details:', {
        voterId: user.voterId,
        email: user.email,
        isActivated: user.isActivated,
      });
    }
  } catch (err) {
    console.error('Error during query:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
