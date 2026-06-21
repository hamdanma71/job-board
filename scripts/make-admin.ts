import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.log("No users found.");
    return;
  }
  
  // Make the very first user an ADMIN (which is likely the user's account)
  const firstUser = users[0];
  await prisma.user.update({
    where: { id: firstUser.id },
    data: { role: 'ADMIN' },
  });

  console.log(`User ${firstUser.email} has been updated to ADMIN role.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
