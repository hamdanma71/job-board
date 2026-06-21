const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.candidateProfile.findMany().then(profiles => console.log(JSON.stringify(profiles, null, 2))).finally(() => prisma.$disconnect());
